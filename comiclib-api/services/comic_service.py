from utils.db import get_supabase

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
        Columns: usesr_id, comics_id, photo_id, note, charactor_name
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
            
        chars_response = query.execute()
        
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
                "charactor_id": char.get('id'),
                "comics": comic_info if comic_info else {}
            }
            result.append(char_data)
            
        return result

    def get_news_list_data(self, user_id: str):
        """
        Fetch data for news list where user_id matches and news_list is 'Y'.
        Equivalent to SQL:
        select b.title, b.rating, a.charactor_name 
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
            .select("charactor_name, comics!inner(title)")\
            .eq("user_id", user_id)\
            .eq("news_list", "Y")\
            .execute()
            
        return response.data

    def get_photo_info_by_id(self, id: int):
        """Fetch photo_info by id (character id)."""
        response = self.supabase.table("photo_info").select("*").eq("id", id).single().execute()
        return response.data

    def delete_photo_info_by_id(self, id: int):
        """Delete photo_info by id (character id)."""
        response = self.supabase.table("photo_info").delete().eq("id", id).execute()
        return response.data

    def add_photo_info(self, photo_data: dict):
        """
        Add a new photo info.
        Table: photo_info
        Columns: user_id, character_id, photo_data (base64)
        """
        response = self.supabase.table("photo_info").insert(photo_data).execute()
        return response.data

