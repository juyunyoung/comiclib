import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, checkConnection } from '../api/firebase';
import { v4 as uuidv4 } from 'uuid';
import { TextField, Button, Rating, Box } from '@mui/material';
import { useTranslation } from '../context/LanguageContext';
import { insertComic } from '../api/sqlite';

const ComicForm = ({ initialData }) => {
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
      setReview(initialData.description || ''); // Using description as review initial value
      if (initialData.image) {
        setCoverImage(initialData.image); // This will be a string URL
      }
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check Firebase Connectivity
    const isConnected = await checkConnection();
    if (!isConnected) {
      alert("Firebase 연결 상태가 좋지 않아 데이터를 저장할 수 없습니다.");
      // If verification fails, stop here (to ensure "transmit when connected")
      // Alternatively, we could save local only, but user asked for connection check to transmit.
      return;
    }

    let imageUrl = '';
    if (coverImage) {
      if (typeof coverImage === 'string') {
        imageUrl = coverImage;
      } else {
        const imageRef = ref(storage, `covers/${uuidv4()}`);
        await uploadBytes(imageRef, coverImage);
        imageUrl = await getDownloadURL(imageRef);
      }
    }

    const comicData = {
      title,
      author,
      review,
      rating,
      coverImage: imageUrl,
      createdAt: new Date(),
    };

    // Save to Firebase
    try {
      console.log("Attempting to save to Firebase...", comicData);
      await addDoc(collection(db, 'comics'), comicData);
      console.log("Successfully saved to Firebase!");
    } catch (firebaseError) {
      console.error("Firebase Save Error:", firebaseError);
      alert(`Firebase 저장 실패: ${firebaseError.message}`);
    }

    // Save to SQLite
    try {
      await insertComic(comicData);
    } catch (err) {
      console.error("Failed to save to SQLite", err);
    }

    setTitle('');
    setAuthor('');
    setReview('');
    setRating(0);
    setCoverImage(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField label={t('comicForm.titleLabel')} value={title} onChange={e => setTitle(e.target.value)} fullWidth margin="normal" />
      <TextField label={t('comicForm.authorLabel')} value={author} onChange={e => setAuthor(e.target.value)} fullWidth margin="normal" />
      <TextField label={t('comicForm.reviewLabel')} value={review} onChange={e => setReview(e.target.value)} fullWidth margin="normal" multiline rows={3} inputProps={{ maxLength: 100 }} />
      <Rating value={rating} onChange={(e, newValue) => setRating(newValue)} />
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
