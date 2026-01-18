from utils.db import get_supabase

class ComicService:
    def __init__(self):
        self.supabase = get_supabase()
        self.table_name = "comics"

    def get_comics(self):
        """Fetch all comics."""
        response = self.supabase.table(self.table_name).select("*").execute()
        return response.data

    def add_comic(self, comic_data: dict):
        """
        Add a new comic.
        comic_data should contain: title, author, review, rating, coverImage
        """
        print(comic_data)
        response = self.supabase.table(self.table_name).insert(comic_data).execute()
        return response.data

    def update_comic(self, comic_id: int, updates: dict):
        """Update a comic by ID."""
        response = self.supabase.table(self.table_name).update(updates).eq("id", comic_id).execute()
        return response.data

    def delete_comic(self, comic_id: int):
        """Delete a comic by ID."""
        response = self.supabase.table(self.table_name).delete().eq("id", comic_id).execute()
        return response.data
