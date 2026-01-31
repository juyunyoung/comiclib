import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ComicForm from '../components/ComicForm';
import { useTranslation } from '../context/LanguageContext';
import { Button, Box } from '@mui/material';

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

  useEffect(() => {
    if (location.state?.editMode) {
      setIsEditMode(false);
    }
  }, [location.state]);

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

  const fetchCharacters = async () => {
    try {
      const response = await fetch(`/api/comics/user-characters?user_id=juyunyoung&comics_id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error("Error fetching characters:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComic();
      fetchCharacters();
    }
  }, [id]);

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
      const response = await fetch('/api/comics/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'juyunyoung',
          comics_id: id,
          character_name: name,
          note: ''
        })
      });

      if (response.ok) {
        setNewCharName('');
        setIsAdding(false);
        fetchCharacters(); // Refresh list
      } else {
        alert("Failed to add character");
      }
    } catch (error) {
      console.error("Error adding character:", error);
      alert("Error adding character");
    }
  };

  const handleDeleteCharacter = async (charId, e) => {
    e.stopPropagation();
    if (!window.confirm(t('detailPage.deleteConfirm'))) return;

    try {
      console.log(charId);
      const response = await fetch(`/api/comics/character/${charId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCharacters(); // Refresh list
      } else {
        alert("Failed to delete character");
      }
    } catch (error) {
      console.error("Error deleting character:", error);
      alert("Error deleting character");
    }
  };

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
          <h1>{t('detailPage.editComic')}</h1>
          <ComicForm initialData={comic} onSubmit={handleUpdate} submitLabel={t('comicForm.submitUpdate')} />
          <Button onClick={() => setIsEditMode(false)} sx={{ mt: 2 }} variant="outlined" color="error">{t('comicForm.cancel')}</Button>
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
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {characters.map((char, index) => (
                  <li key={index} style={{
                    padding: '8px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '20px',
                    backgroundColor: '#f9f9f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'fit-content',
                    gap: '8px'
                  }}>
                    <strong>{char.character_name}</strong>
                    <span
                      onClick={(e) => handleDeleteCharacter(char.character_id, e)}
                      style={{
                        color: 'red',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '1em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        marginLeft: '4px'
                      }}
                    >
                      -
                    </span>
                  </li>
                ))}

                {isAdding && (
                  <li style={{
                    padding: '8px 16px',
                    border: '1px solid #1976d2',
                    borderRadius: '20px',
                    backgroundColor: '#fff',
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
                  </li>
                )}

                <li onClick={handleAddClick} style={{
                  padding: '8px 16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '20px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'fit-content',
                  color: '#1976d2',
                  fontWeight: 'bold'
                }}>
                  +
                </li>
              </ul>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <p style={{ margin: 0 }}>{t('detailPage.noCharacters')}</p>

                {isAdding ? (
                  <div style={{
                    padding: '4px 8px',
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
                  </div>
                ) : (
                  <button onClick={handleAddClick} style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: '1px solid #1976d2',
                    background: 'white',
                    color: '#1976d2',
                    cursor: 'pointer'
                  }}>+</button>
                )}
              </div>
            )}
          </Box>
        </>
      )}
    </div>
  );
};

export default HomeDetail;
