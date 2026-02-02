import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';
import { Button, TextField, Grid, Card, CardMedia, CardContent, Typography, Box, Rating, Modal, IconButton, Alert, CircularProgress, Avatar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ComicForm from '../components/ComicForm'; // This component is not used in the provided JSX, but kept from the diff
import CloseIcon from '@mui/icons-material/Close'; // This icon is not used in the provided JSX, but kept from the diff
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import api from '../utils/api';

const DetailPage = () => {
  const { id } = useParams(); // This is comic_character.id
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true); // Re-added loading state
  const [error, setError] = useState(null); // Re-added error state
  const [character, setCharacter] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false); // New state from diff

  // Modal State
  const [selectedImage, setSelectedImage] = useState(null);
  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form State (retained from original for editing character details)
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
      const data = await api.get(`/api/comics/photo-info/${id}`);
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
      setError(error.message); // Set error state
    }
  };

  const fetchCharacter = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/api/comics/character/${id}`);
      // api.get throws if error, returns json if ok.
      // Assuming data is array or object based on API.
      // Supabase usually returns list.
      const charData = Array.isArray(data) ? data[0] : data;
      setCharacter(charData);

      // Initialize form fields
      setName(charData.character_name || '');
      setAffinity(charData.affinity || 0);
      setNote(charData.note || '');
      setPhotoUrl(charData.photo_url || '');
      setIsNewsMember(charData.news_list === 'Y');

    } catch (error) {
      console.error("Error deleting character:", error);
      showAlert(`${t('detailPage.deleteCharFail') || 'Error deleting character'}: ${error.message}`, t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const savePhoto = async (photoBase64) => {
    try {
      await api.post('/api/comics/photo-info', {
        id: id,
        photo_base64: photoBase64
      });
      fetchPhotos();
    } catch (error) {
      console.error("Error saving photo:", error);
      showAlert(t('detailPage.uploadFail'), t('common.error'), 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showAlert(t('detailPage.fileSizeTooLarge'), t('common.warning'), 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      // We use api.upload which handles FormData
      const uploadResponse = await api.upload('/api/comics/upload', formData); // Reusing upload endpoint which returns { url: ... }
      // Let's assume we use the URL returned by upload.
      await savePhoto(uploadResponse.url);

    } catch (err) {
      console.error("Upload failed", err);
      showAlert(t('detailPage.uploadFail'), t('common.error'), 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      let finalPhotoUrl = photoUrl;

      // If a new file is selected, upload it first
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadResponse = await api.upload('/api/comics/upload', formData);
        finalPhotoUrl = uploadResponse.url;
      }

      const updates = {
        character_name: name,
        affinity: affinity,
        note: note,
        photo_url: finalPhotoUrl,
        news_list: isNewsMember ? 'Y' : 'N'
      };

      await api.put(`/api/comics/character/${id}`, updates);

      showAlert(t('detailPage.updateSuccess'), t('common.success'), 'success');
      fetchCharacter(); // Refresh data
      setIsEditMode(false); // Exit edit mode if applicable, though not explicitly used in current JSX
    } catch (error) {
      console.error("Update failed:", error);
      showAlert(`${t('detailPage.updateFail') || 'Update failed'}: ${error.message}`, t('common.error'), 'error');
    }
  };

  const handleDeletePhoto = (photoId, photoNum) => {
    setDeleteTarget({ id: photoId, num: photoNum });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      // Pass num as query parameter
      await api.del(`/api/comics/photo-info/${deleteTarget.id}?num=${deleteTarget.num}`);
      fetchPhotos();
      showAlert(t('detailPage.deleteSuccess') || 'Photo deleted', t('common.success'), 'success');
    } catch (error) {
      console.error("Delete failed:", error);
      showAlert(t('detailPage.deletePhotoFail'), t('common.error'), 'error');
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
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
            onClick={handleUpdate}
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
              const imageSrc = photo.photo_base64.startsWith('http')
                ? photo.photo_base64
                : (photo.photo_base64.startsWith('data:')
                  ? photo.photo_base64
                  : `data:image/jpeg;base64,${photo.photo_base64}`);

              return (
                <Box key={photo.id || index} sx={{ position: 'relative' }}>
                  <Card
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
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(photo.id, photo.num);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                      zIndex: 10
                    }}
                    size="small"
                  >
                    <RemoveCircleIcon />
                  </IconButton>
                </Box>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('detailPage.deleteConfirmTitle') || 'Delete Photo'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('detailPage.deleteConfirmPhoto') || 'Are you sure you want to delete this photo?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            {t('common.delete') || 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default DetailPage;
