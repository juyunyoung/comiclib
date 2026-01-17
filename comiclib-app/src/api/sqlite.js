// This file is now the client-side API for comics, replacing SQLite logic.

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/comics/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload image');
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const insertComic = async (data) => {
  try {
    const response = await fetch('/api/comics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to insert comic');
    return true;
  } catch (error) {
    console.error('Error inserting comic:', error);
    return false;
  }
};

export const getComics = async () => {
  try {
    const response = await fetch('/api/comics');
    if (!response.ok) throw new Error('Failed to fetch comics');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching comics:', error);
    return [];
  }
};
