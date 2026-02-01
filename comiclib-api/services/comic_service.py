from utils.db import get_supabase
from google.cloud import storage
import base64
from datetime import timedelta
import datetime

class ComicService:
    def __init__(self):
        self.supabase = get_supabase()
        self.table_name = "comics"

    def get_comics(self):
        """Fetch all comics."""
        response = self.supabase.table(self.table_name).select("*").execute()
        return response.data

    def get_comic_by_id(self, comic_id: int):
        """Fetch a single comic by ID."""
        response = self.supabase.table(self.table_name).select("*").eq("id", comic_id).single().execute()
        return response.data

    def add_comic(self, comic_data: dict):
        """
        Add a new comic.
        comic_data should contain: title, author, review, rating, coverImage
        """
        response = self.supabase.table(self.table_name).insert(comic_data).execute()
        return response.data

    def add_comic_character(self, character_data: dict):
        """
        Add a new comic character.
        Table: comic_character
        Columns: usesr_id, comics_id, photo_id, note, character_name
        """
        print(character_data)   
        response = self.supabase.table("comic_character").insert(character_data).execute()
        print(response.data)
        return response.data

    def update_comic(self, comic_id: int, updates: dict):
        """Update a comic by ID."""
        response = self.supabase.table(self.table_name).update(updates).eq("id", comic_id).execute()
        return response.data

    def delete_comic(self, comic_id: int):
        """Delete a comic by ID."""
        response = self.supabase.table(self.table_name).delete().eq("id", comic_id).execute()
        return response.data

    def delete_comic_character(self, character_id: int):
        """Delete a comic character by ID."""
        response = self.supabase.table("comic_character").delete().eq("id", character_id).execute()
        return response.data

    def get_character_by_id(self, character_id: int):
        """Fetch a single character by ID."""
        response = self.supabase.table("comic_character").select("*").eq("id", character_id).single().execute()
        return response.data

    def update_comic_character(self, character_id: int, updates: dict):
        """Update a comic character by ID."""
        response = self.supabase.table("comic_character").update(updates).eq("id", character_id).execute()
        return response.data

    def get_characters_info(self, user_id: str, comics_id: int = None):
        """
        Fetch characters with their associated comic info.
        Optionally filter by comics_id.
        Since foreign key relationship might be missing, we do a manual join.
        """

        
        # 1. Fetch characters for the user
        query = self.supabase.table("comic_character").select("*").eq("user_id", user_id).order("affinity", desc=True)
        
        if comics_id:
            query = query.eq("comics_id", comics_id)
        print(query)   
        chars_response = query.execute()
        print(chars_response.data)
        characters = chars_response.data
        if not characters:
            return []

        # 2. Extract comic IDs
        comic_ids = [c['comics_id'] for c in characters if 'comics_id' in c]
        if not comic_ids:
            return characters # Return characters without comic info if no IDs

        # 3. Fetch comics details
        comics_response = self.supabase.table("comics")\
            .select("id, title, rating, coverImage")\
            .in_("id", comic_ids)\
            .execute()
        
        comics_map = {c['id']: c for c in comics_response.data}

        # 4. Merge data
        result = []
        for char in characters:
            comic_info = comics_map.get(char.get('comics_id'))
            
            # Construct the format expected by frontend (or flat, but frontend expects nested 'comics')
            char_data = {
                **char,
                "character_id": char.get('id'),
                "comics": comic_info if comic_info else {}
            }
            result.append(char_data)
            
        return result

    def get_news_list_data(self, user_id: str):
        """
        Fetch data for news list where user_id matches and news_list is 'Y'.
        Equivalent to SQL:
        select b.title, b.rating, a.character_name 
        from comic_character a, comics b
        where a.user_id = b.user_id
        and a.comics_id = b.id
        and a.user_id = :user_id
        and a.news_list = 'Y'
        """
        # Using Supabase embedding (joins)
        # We select from comic_character (a) and join comics (b)
        # 'comics!inner' forces an inner join (like a.comics_id = b.id)
        # Filters are applied on comic_character
        response = self.supabase.table("comic_character")\
            .select("character_name, comics!inner(title)")\
            .eq("user_id", user_id)\
            .eq("news_list", "Y")\
            .execute()
        print(response.data)   
        return response.data

    def get_photo_info_by_id(self, id: int):
        """Fetch photo_info by id (character id)."""
        response = self.supabase.table("photo_info").select("*").eq("id", id).order("num").execute()
        photos = response.data
        
        # Generate Signed URLs for GCS paths
        client = storage.Client()
        bucket = client.bucket("2dfriend_photo")
        
        for photo in photos:
            photo_val = photo.get('photo_base64', '')
            blob_path = None
            
            # Case 1: Stored as relative path (New way)
            if photo_val and photo_val.startswith('AI_photo/'):
                blob_path = photo_val
            
            # Case 2: Stored as full public URL (Old way, but now private)
            elif photo_val and photo_val.startswith('https://storage.googleapis.com/2dfriend_photo/'):
                # Extract path after bucket name
                blob_path = photo_val.replace('https://storage.googleapis.com/2dfriend_photo/', '')

            if blob_path:
                try:
                    blob = bucket.blob(blob_path)
                    # Generate signed URL valid for 1 hour
                    signed_url = blob.generate_signed_url(
                        version="v4",
                        expiration=datetime.timedelta(hours=1),
                        method="GET"
                    )
                    photo['photo_base64'] = signed_url
                    print(photo['photo_base64'])
                except Exception as e:
                    print(f"Error generating signed URL for {photo_val}: {e}")
                    if "private key" in str(e):
                        print("HINT: Signed URLs require a Service Account Key (JSON). 'gcloud auth login' credentials do not have a private key.")
                    # Keep original value if generation fails
                    pass
        
        return photos

    def delete_photo_info_by_id(self, id: int):
        """Delete photo_info by id (character id)."""
        response = self.supabase.table("photo_info").delete().eq("id", id).execute()
        return response.data

    def add_photo_info(self, photo_data: dict):
        """
        Add a new photo info.
        Table: photo_info
        Columns: id, num, photo_base64, keyword1, keyword2
        """
        # Get the character ID from the input data
        char_id = photo_data.get('id')
        print(char_id)
        # Query for the maximum num for this character ID
        max_num_response = self.supabase.table("photo_info")\
            .select("num")\
            .eq("id", char_id)\
            .order("num", desc=True)\
            .limit(1)\
            .execute()
            
        current_max_num = 0
        if max_num_response.data:
            current_max_num = max_num_response.data[0].get('num', 0)
            
        # Set the next num value
        photo_data['num'] = current_max_num + 1
        
        # Upload to GCS
        try:
            # Decode base64
            image_data = base64.b64decode(photo_data.get('photo_base64'))
            
            # Determine the blob name
            blob_name = f"AI_photo/character_{char_id}_{photo_data['num']}.jpg"
            
            # GCS Upload
            # Note: This requires GOOGLE_APPLICATION_CREDENTIALS to be set or 'gcloud auth application-default login'
            client = storage.Client()
            bucket = client.bucket("2dfriend_photo")
            blob = bucket.blob(blob_name)
            
            # Upload from string (bytes)
            blob.upload_from_string(image_data, content_type='image/jpeg')
            
            # Store the BLOB NAME (Path) instead of public URL
            # The frontend will receive a Signed URL via get_photo_info_by_id
            print(f"Uploaded to GCS Path: {blob_name}")
            
             # Update photo_data to store PATH
            photo_data['photo_base64'] = blob_name
            
        except Exception as e:
            print(f"GCS Upload Failed: {e}")
            if "invalid_grant" in str(e):
                print("HINT: Run 'gcloud auth application-default login' or set GOOGLE_APPLICATION_CREDENTIALS")
            # Proceeding might fail if photo_base64 is still binary and schema expects text (URL/Path).
            # But if validation fails, it fails.
        print("photo_data['photo_base64']"+photo_data['photo_base64'])

        response = self.supabase.table("photo_info").insert(photo_data).execute()
        return response.data

