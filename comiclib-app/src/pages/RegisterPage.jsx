import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ComicForm from '../components/ComicForm';
import { useTranslation } from '../context/LanguageContext';
import { TextField, Button, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Typography, Box, CircularProgress } from '@mui/material';

const RegisterPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [isCharacterLoading, setIsCharacterLoading] = useState(false);

  const [selectedCharacters, setSelectedCharacters] = useState([]);

  useEffect(() => {
    if (location.state && location.state.editMode && location.state.data) {
      const { data } = location.state;
      // Pre-fill the form with existing data
      setSelectedBook({
        title: data.title,
        author: data.author,
        description: '', // You might want to fetch description if available or leave empty/handled by form
        rating: data.rating,
        review: data.review, // Assuming 'review' is part of the data passed
        image: data.coverImage,
        // Include ID for update logic if needed (e.g., hidden field or separate state)
        id: data.id,
        user_id: data.user_id,
      });
      console.log("Edit mode enabled for:", data.title);
    }
  }, [location.state]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setSearchResults([]);
    setSelectedCharacters([]); // Clear selections on new search

    try {
      // Use the proxy configured in vite.config.js
      const response = await fetch(`/api/naver/search/book.json?query=${encodeURIComponent(query)}&display=5`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        setSearchResults(data.items);
      } else {
        // Fallback to Game Search Agent
        console.log("Naver search empty, trying Game Agent...");
        const gameResponse = await fetch(`/api/search/game?query=${encodeURIComponent(query)}`);

        if (gameResponse.ok) {
          const gameData = await gameResponse.json();
          if (gameData.items && gameData.items.length > 0) {
            setSearchResults(gameData.items);
          }
        }
      }
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleSelectBook = async (book) => {
    // Format book data for ComicForm
    // Naver API returns title with <b> tags, remove them
    const cleanTitle = book.title.replace(/<[^>]+>/g, '');
    const cleanAuthor = book.author.replace(/<[^>]+>/g, '');
    const cleanDescription = book.description.replace(/<[^>]+>/g, '');

    setSelectedBook({
      title: cleanTitle,
      author: cleanAuthor,
      description: cleanDescription,
      image: book.image,
    });
    setSearchResults([]); // Clear results after selection

    // Search for characters
    setIsCharacterLoading(true);
    setCharacters([]);
    setSelectedCharacters([]); // Reset selections
    try {
      const response = await fetch(`/api/search/character?query=${encodeURIComponent(cleanTitle)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.characters) {
          setCharacters(data.characters);
        }
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setIsCharacterLoading(false);
    }
  };

  const handleCharacterClick = (charName) => {
    setSelectedCharacters(prev => {
      if (prev.includes(charName)) {
        return prev.filter(name => name !== charName);
      } else {
        return [...prev, charName];
      }
    });
  };

  const handleSave = async (comicData) => {
    try {
      let imageUrl = comicData.coverImage;

      // If coverImage is a File object, upload it first
      if (comicData.file instanceof File) {
        const formData = new FormData();
        formData.append('file', comicData.file);

        const uploadResponse = await fetch('/api/comics/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Image upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url;
      }

      // Save comic data
      const response = await fetch('/api/comics', {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...comicData,
          coverImage: imageUrl,
          user_id: 'juyunyoung',
          file: undefined // Remove file object from JSON payload
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save comic');
      }

      const result = await response.json();

      // Save selected characters
      if (result && selectedCharacters.length > 0) {
        // Handle Supabase response which is typically an array, but be robust
        const newComicId = Array.isArray(result) ? result[0]?.id : result?.id;

        if (newComicId) {
          try {
            const charPromises = selectedCharacters.map(charName =>
              fetch('/api/comics/character', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: 'juyunyoung',
                  comics_id: newComicId,
                  character_name: charName,
                  note: ''
                })
              })
            );
            await Promise.all(charPromises);
          } catch (charError) {
            console.error('Error saving characters:', charError);
          }
        }
      }

      alert(t('registerPage.saveSuccess'));

      // Reset page state
      setQuery('');
      setSearchResults([]);
      setSelectedBook(null);
      setCharacters([]);
      setSelectedCharacters([]);
      setHasSearched(false);

      return true;

    } catch (error) {
      console.error('Save error:', error);
      alert(`${t('registerPage.saveFail')}${error.message}`);
      return false;
    }
  };

  return (
    <div>
      <h1>{location.state?.editMode ? t('registerPage.editTitle') : t('registerPage.title')}</h1>

      <Box sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('home.searchLabel')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            id="book-search-query"
            name="book-search-query"
            label={t('home.searchLabel')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            fullWidth
            autoComplete="off"
            inputProps={{
              autoComplete: 'off',
              form: {
                autoComplete: 'off',
              },
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : t('registerPage.searchButton')}
          </Button>
        </Box>

        {searchResults.length > 0 ? (
          <List sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            {searchResults.map((book, index) => (
              <ListItem
                key={index}
                disablePadding
              >
                <ListItemButton onClick={() => handleSelectBook(book)}>
                  <ListItemAvatar>
                    <Avatar src={book.image} variant="rounded" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<span dangerouslySetInnerHTML={{ __html: book.title }} />}
                    secondary={book.author.replace(/<[^>]+>/g, '')}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          hasSearched && !loading && (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
              {t('registerPage.noResults')}
            </Typography>
          )
        )}
      </Box>

      <Box sx={{ mt: 4 }}>
        {isCharacterLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>{t('registerPage.loadingCharacters')}</Typography>
          </Box>
        ) : characters.length > 0 ? (
          <Box>
            <Typography variant="h6" gutterBottom>{t('registerPage.selectCharacter')}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {characters.map((char, index) => {
                const isSelected = selectedCharacters.includes(char.name);
                return (
                  <Box
                    key={index}
                    onClick={() => handleCharacterClick(char.name)}
                    sx={{
                      border: isSelected ? '2px solid #1976d2' : '1px solid #eee',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: isSelected ? '#e3f2fd' : '#f9f9f9',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: isSelected ? '#1565c0' : 'inherit',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      '&:hover': {
                        bgcolor: isSelected ? '#bbdefb' : '#eee'
                      }
                    }}
                  >
                    <Typography variant="body2">{char.name}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : null}
      </Box>

      <ComicForm initialData={selectedBook} onSubmit={handleSave} submitLabel={t('comicForm.submitAdd')} />
    </div>
  );
};

export default RegisterPage;
