import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CharacterRanking from '../components/CharacterRanking';
import ComicForm from '../components/ComicForm';
import { useTranslation } from '../context/LanguageContext';
import { Button } from '@mui/material';

const HomeDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [comic, setComic] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (location.state?.editMode) {
      setIsEditMode(false);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchComic = async () => {
      try {
        const response = await fetch(`/api/comics/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch comic');
        }
        const data = await response.json();
        setComic(data);
      } catch (error) {
        console.error("Error fetching comic detail:", error);
      }
    };
    if (id) {
      fetchComic();
    }
  }, [id]);

  const handleUpdate = async (updatedData) => {
    try {
      let imageUrl = updatedData.coverImage;

      if (updatedData.file instanceof File) {
        const formData = new FormData();
        formData.append('file', updatedData.file);
        const uploadResponse = await fetch('/api/comics/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Image upload failed');
        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url;
      }

      const payload = {
        ...updatedData,
        coverImage: imageUrl,
        file: undefined
      };

      const response = await fetch(`/api/comics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update comic');

      const result = await response.json();
      const updated = Array.isArray(result) ? result[0] : result;
      setComic(updated);
      setIsEditMode(false);
      alert('Successfully updated!');

    } catch (error) {
      console.error("Update failed:", error);
      alert('Update failed: ' + error.message);
    }
  };

  if (!comic) {
    return <div>{t('detailPage.loading')}</div>;
  }

  return (
    <div>
      {isEditMode ? (
        <>
          <h1>Edit Comic</h1>
          <ComicForm initialData={comic} onSubmit={handleUpdate} submitLabel={t('comicForm.submitUpdate')} />
          <Button onClick={() => setIsEditMode(false)} sx={{ mt: 2 }} variant="outlined" color="error">Cancel</Button>
        </>
      ) : (
        <>
          <h1>{comic.title}</h1>
          <p>{t('detailPage.author')}: {comic.author}</p>
          <p>{t('detailPage.rating')}: {comic.rating} / 5</p>
          <p>{t('detailPage.review')}: {comic.review}</p>
          <img src={comic.coverImage} alt={comic.title} style={{ width: '200px' }} />
          <Button variant="contained" onClick={() => setIsEditMode(true)} sx={{ display: 'block', my: 2 }}>
            Edit
          </Button>
          <CharacterRanking comicId={id} />
        </>
      )}
    </div>
  );
};

export default HomeDetail;
