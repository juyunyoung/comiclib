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
        Table: comic_charactor
        Columns: usesr_id, comics_id, photo_id, note, charactor_name
        """
        print(character_data)   
        response = self.supabase.table("comic_charactor").insert(character_data).execute()
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

    def get_characters_with_comic_info(self, user_id: str):
        """
        Fetch characters with their associated comic info.
        Since foreign key relationship might be missing, we do a manual join.
        """
        # 1. Fetch characters for the user
        chars_response = self.supabase.table("comic_charactor")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()
        
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
                "charactor_name": char.get('charactor_name'),
                "comics": comic_info if comic_info else {}
            }
            result.append(char_data)
            
        return result
