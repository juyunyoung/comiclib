import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TextField, Button, Rating, Box } from '@mui/material';
import { useTranslation } from '../context/LanguageContext';

const ComicForm = ({ initialData, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [coverImage, setCoverImage] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAuthor(initialData.author || '');
      setReview(initialData.description || '');
      if (initialData.image) {
        setCoverImage(initialData.image);
      }
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const comicData = {
      title,
      author,
      review,
      rating,
      coverImage: coverImage,
      file: coverImage instanceof File ? coverImage : null // Pass file if it is a File object
    };

    if (onSubmit) {
      const success = await onSubmit(comicData);

      if (success) {
        setTitle('');
        setAuthor('');
        setReview('');
        setRating(0);
        setCoverImage(null);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField label={t('comicForm.titleLabel')} value={title} onChange={e => setTitle(e.target.value)} fullWidth margin="normal" />
      <TextField label={t('comicForm.authorLabel')} value={author} onChange={e => setAuthor(e.target.value)} fullWidth margin="normal" />
      <TextField label={t('comicForm.reviewLabel')} value={review} onChange={e => setReview(e.target.value)} fullWidth margin="normal" multiline rows={3} inputProps={{ maxLength: 100 }} />
      <Rating value={rating} onChange={(e, newValue) => setRating(newValue)} />
      <TextField
        label={t('comicForm.imageUrlLabel')}
        value={typeof coverImage === 'string' ? coverImage : ''}
        onChange={(e) => setCoverImage(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Box sx={{ mt: 2, mb: 1 }}>
        {coverImage && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <img
              src={typeof coverImage === 'string' ? coverImage : URL.createObjectURL(coverImage)}
              alt="Cover Preview"
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }}
            />
          </Box>
        )}
      </Box>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        sx={{ mt: 2, mb: 4, display: 'block', fontSize: '1.2rem', py: 1.5, fontWeight: 'bold' }}
      >
        {t('comicForm.submit')}
      </Button>
    </form>
  );
};

export default ComicForm;
