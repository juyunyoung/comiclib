import api from '../utils/api';
import { useUser } from '../context/UserContext';
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ComicForm from '../components/ComicForm';
import { useTranslation } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';
import { Button, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

// ... (imports remain the same, just updated @mui/material import above)

const HomeDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [comic, setComic] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const { t } = useTranslation();
  const { userId } = useUser();
  const { showAlert } = useAlert();

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'comic' | 'character', id: string }
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (location.state?.editMode !== undefined) {
      setIsEditMode(location.state.editMode);
    }
  }, [location.state]);

  const fetchComic = async () => {
    try {
      const data = await api.get(`/api/comics/${id}`);
      setComic(data);
    } catch (error) {
      console.error("Error fetching comic detail:", error);
    }
  };

  const fetchCharacters = async () => {
    try {
      const data = await api.get(`/api/comics/user-characters?user_id=${userId}&comics_id=${id}`);
      setCharacters(data);
    } catch (error) {
      console.error("Error fetching characters:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComic();
      fetchCharacters();
    }
  }, [id, userId]);

  const handleEditClick = async () => {
    await fetchComic(); // Fetch fresh data
    setIsEditMode(true);
  };

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCharInputKeyDown = async (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!newCharName.trim()) {
        setIsAdding(false);
        return;
      }
      await saveNewCharacter(newCharName);
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewCharName('');
    }
  };

  const saveNewCharacter = async (name) => {
    try {
      await api.post('/api/comics/character', {
        user_id: userId,
        comics_id: id,
        character_name: name,
        note: ''
      });

      setNewCharName('');
      setIsAdding(false);
      fetchCharacters(); // Refresh list

    } catch (error) {
      console.error("Error adding character:", error);
      showAlert(t('detailPage.addCharFail'), t('common.error'), 'error');
    }
  };

  const initiateDeleteCharacter = (charId, e) => {
    e.stopPropagation();
    setDeleteTarget({ type: 'character', id: charId });
    setIsDeleteDialogOpen(true);
  };

  // Renamed to conformDelete to call actual API
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'character') {
      try {
        await api.del(`/api/comics/character/${deleteTarget.id}`);
        fetchCharacters();
      } catch (error) {
        console.error("Error deleting character:", error);
        showAlert(t('detailPage.deleteCharFail'), t('common.error'), 'error');
      }
    } else if (deleteTarget.type === 'comic') {
      try {
        await api.del(`/api/comics/${id}`);
        showAlert(t('common.deleteSuccess'), t('common.success'), 'success');
        navigate('/stats', { state: { activeTab: location.state?.activeTab || 1 } });
      } catch (error) {
        console.error("Delete failed:", error);
        showAlert(t('common.deleteFail'), t('common.error'), 'error');
      }
    }
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  };


  const handleDeleteCharacter = async (charId, e) => {
    // Deprecated in favor of initiateDeleteCharacter but keeping function signature if needed or removing
    // Actually we will replace usage
  };

  const handleUpdate = async (updatedData) => {
    try {
      let imageUrl = updatedData.coverImage;

      if (updatedData.file instanceof File) {
        const formData = new FormData();
        formData.append('file', updatedData.file);
        const uploadResult = await api.upload('/api/comics/upload', formData);
        imageUrl = uploadResult.url;
      }

      const payload = {
        ...updatedData,
        coverImage: imageUrl,
        file: undefined
      };

      const result = await api.put(`/api/comics/${id}`, payload);

      const updated = Array.isArray(result) ? result[0] : result;
      setComic(updated);
      setIsEditMode(false);
      showAlert(t('detailPage.updateSuccess'), t('common.success'), 'success');

    } catch (error) {
      console.error("Update failed:", error);
      showAlert(`${t('detailPage.updateFail') || 'Update failed'}: ${error.message}`, t('common.error'), 'error');
    }
  };

  const handleInitiateDeleteComic = () => {
    setDeleteTarget({ type: 'comic' });
    setIsDeleteDialogOpen(true);
  };

  if (!comic) {
    return <div>{t('detailPage.loading')}</div>;
  }

  return (
    <div>
      {isEditMode ? (
        <>
          <h1>{t('detailPage.editComic')}</h1>
          <ComicForm initialData={comic} onSubmit={handleUpdate} submitLabel={t('comicForm.submitUpdate')} />
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button onClick={() => setIsEditMode(false)} variant="outlined" color="primary" sx={{ flexGrow: 1 }}>{t('comicForm.cancel')}</Button>
            <Button onClick={handleInitiateDeleteComic} variant="contained" color="error" sx={{ flexGrow: 1 }}>{t('common.delete')}</Button>
          </Box>
        </>
      ) : (
        <>
          <Button
            variant="outlined"
            onClick={() => navigate('/stats', { state: { activeTab: location.state?.activeTab || 0 } })}
            sx={{ mb: 2 }}
          >
            &larr; {t('detailPage.backToList')}
          </Button>
          <h1>{comic.title}</h1>
          <p>{t('detailPage.author')}: {comic.author}</p>
          <p>{t('detailPage.rating')}: {comic.rating} / 5</p>
          <p>{t('detailPage.review')}: {comic.review}</p>
          <img src={comic.coverImage} alt={comic.title} style={{ width: '200px' }} />

          <Button variant="contained" onClick={handleEditClick} sx={{ display: 'block', my: 2 }}>
            {t('detailPage.edit')}
          </Button>

          <Box sx={{ mt: 4 }}>
            <h3>{t('detailPage.friendInfo')}</h3>
            {characters.length > 0 ? (
              <Box component="ul" sx={{ listStyle: 'none', p: 0, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {characters.map((char, index) => (
                  <Box component="li" key={index} sx={{
                    py: 1, px: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: '20px',
                    bgcolor: '#f9f9f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'fit-content',
                    gap: 1
                  }}>
                    <strong>{char.character_name}</strong>
                    <Box
                      component="span"
                      onClick={(e) => initiateDeleteCharacter(char.character_id, e)}
                      sx={{
                        color: 'error.main',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '1em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        ml: 0.5
                      }}
                    >
                      -
                    </Box>
                  </Box>
                ))}

                {isAdding && (
                  <Box component="li" sx={{
                    py: 1, px: 2,
                    border: '1px solid #1976d2',
                    borderRadius: '20px',
                    bgcolor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'fit-content'
                  }}>
                    <input
                      value={newCharName}
                      onChange={(e) => setNewCharName(e.target.value)}
                      onKeyDown={handleCharInputKeyDown}
                      autoFocus
                      placeholder="Name"
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '10ch',
                        fontSize: 'inherit',
                        fontWeight: 'bold',
                        fontFamily: 'inherit'
                      }}
                    />
                  </Box>
                )}

                <Box component="li" onClick={handleAddClick} sx={{
                  py: 1, px: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '20px',
                  bgcolor: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'fit-content',
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}>
                  +
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <p style={{ margin: 0 }}>{t('detailPage.noCharacters')}</p>

                {isAdding ? (
                  <Box sx={{
                    py: 0.5, px: 1,
                    border: '1px solid #1976d2',
                    borderRadius: '20px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <input
                      value={newCharName}
                      onChange={(e) => setNewCharName(e.target.value)}
                      onKeyDown={handleCharInputKeyDown}
                      autoFocus
                      placeholder="Name"
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '10ch',
                        fontSize: '0.9em'
                      }}
                    />
                  </Box>
                ) : (
                  <Button onClick={handleAddClick} size="small" variant="outlined" sx={{ borderRadius: '20px', minWidth: '30px', p: '2px 8px' }}>+</Button>
                )}
              </Box>
            )}
          </Box>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {deleteTarget?.type === 'comic' ? (t('detailPage.deleteComicTitle') || 'Delete Comic') : (t('detailPage.deleteCharTitle') || 'Delete Character')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {deleteTarget?.type === 'comic'
              ? (t('detailPage.deleteConfirm') || 'Are you sure you want to delete this comic and all its characters?')
              : (t('detailPage.deleteConfirm') || 'Are you sure you want to delete this character?')}
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
    </div>
  );
};

export default HomeDetail;
