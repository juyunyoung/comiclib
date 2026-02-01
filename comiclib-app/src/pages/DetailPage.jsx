import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { Button, Box, Typography, Card, CardContent, Alert, CircularProgress, Rating, TextField, Avatar, Modal } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const DetailPage = () => {
  const { id } = useParams(); // 'character_id'
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [character, setCharacter] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // Modal State

  // Form State
  const [name, setName] = useState('');
  const [affinity, setAffinity] = useState(0);
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [isNewsMember, setIsNewsMember] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCharacter();
      fetchPhotos();
    }
  }, [id]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/comics/photo-info/${id}`);
      if (response.ok) {
        const data = await response.json();

        setPhotos(data || []);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const fetchCharacter = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/comics/character/${id}`);
      if (!response.ok) throw new Error('Failed to fetch character');
      const data = await response.json();
      setCharacter(data);

      // Initialize form
      setName(data.character_name || '');
      setAffinity(data.affinity || 0);
      setNote(data.note || '');
      setPhotoUrl(data.photo_url || '');
      setIsNewsMember(data.news_list === 'Y');

    } catch (error) {
      console.error("Error fetching character:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      let finalPhotoUrl = photoUrl;

      // If a new file is selected, upload it first
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadResponse = await fetch('/api/comics/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Image upload failed');
        const uploadResult = await uploadResponse.json();
        finalPhotoUrl = uploadResult.url;
      }

      const updates = {
        character_name: name,
        affinity: affinity,
        note: note,
        photo_url: finalPhotoUrl,
        news_list: isNewsMember ? 'Y' : 'N'
      };

      const response = await fetch(`/api/comics/character/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update character');

      alert(t('detailPage.updateSuccess'));
      // Navigate back or refresh? User said "allow modification", usually implies staying or going back.
      // Let's stay on page but refresh data to confirm
      fetchCharacter();

    } catch (err) {
      console.error("Update failed:", err);
      alert(`${t('detailPage.updateFail')}${err.message}`);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      // Preview
      setPhotoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">Error: {error}</Alert>
        <Button onClick={() => navigate('/stats', { state: { activeTab: location.state?.activeTab || 0 } })} sx={{ mt: 2 }}>{t('detailPage.backToList')}</Button>
      </Box>
    );
  }

  if (!character) return <div>{t('detailPage.characterNotFound')}</div>;

  return (
    <Box sx={{ pb: 4 }}>
      <Button
        variant="outlined"
        onClick={() => navigate('/stats', { state: { activeTab: location.state?.activeTab || 0 } })}
        sx={{ mb: 2 }}
      >
        &larr; {t('detailPage.backToList')}
      </Button>

      <Typography variant="h4" gutterBottom>
        {t('detailPage.editCharacter')}
      </Typography>

      <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Photo Upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={photoUrl}
              alt={name}
              sx={{ width: 150, height: 150 }}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%', maxWidth: '400px' }}>
              <TextField
                label={t('detailPage.imageUrl')}
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.target.value);
                  setPhotoFile(null); // Clear file if user types URL
                }}
                fullWidth
                size="small"
              />
              <Button variant="contained" component="label" size="small" sx={{ whiteSpace: 'nowrap' }}>
                {t('detailPage.uploadPhoto')}
                <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
              </Button>
            </Box>
          </Box>

          {/* Name */}
          <TextField
            label={t('detailPage.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          {/* Affinity and News List */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            <Box>
              <Typography component="legend">{t('detailPage.affinity')}</Typography>
              <Rating
                name="affinity"
                value={affinity}
                onChange={(event, newValue) => {
                  setAffinity(newValue);
                }}
                icon={<FavoriteIcon fontSize="inherit" color="error" />}
                emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="legend">{t('detailPage.newsList')}</Typography>
              <input
                type="checkbox"
                checked={isNewsMember}
                onChange={(e) => setIsNewsMember(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </Box>
          </Box>

          {/* Note */}
          <TextField
            label={t('detailPage.note')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={4}
            fullWidth
          />

          {/* Save Button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSave}
            sx={{ mt: 2 }}
          >
            {t('detailPage.saveChanges')}
          </Button>

        </Box>
      </Card>

      {/* Styled Photos Grid */}
      {photos.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            {t('detailPage.characterPhotos') || 'Character Photos'}
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            width: '100%'
          }}>
            {photos.map((photo, index) => {
              console.log(photo)
              const imageSrc = photo.photo_base64.startsWith('http')
                ? photo.photo_base64
                : (photo.photo_base64.startsWith('data:')
                  ? photo.photo_base64
                  : `data:image/jpeg;base64,${photo.photo_base64}`);

              return (
                <Card
                  key={photo.id || index}
                  variant="outlined"
                  onClick={() => setSelectedImage(imageSrc)}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}>
                  <Box sx={{
                    width: '100%',
                    paddingTop: '100%', // 1:1 Aspect Ratio
                    position: 'relative'
                  }}>
                    <img
                      src={imageSrc}
                      alt={`Character Photo ${index + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                </Card>
              )
            })}
          </Box>
        </Box>
      )}

      {/* Image Modal */}
      <Modal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '60%',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 1,
            borderRadius: 2,
            outline: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
          onClick={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Enlarged Character"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '4px',
              }}
            />
          )}
        </Box>
      </Modal>

    </Box>
  );
};

export default DetailPage;
