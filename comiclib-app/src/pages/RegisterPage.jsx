import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ComicForm from '../components/ComicForm';
import { useTranslation } from '../context/LanguageContext';
import { TextField, Button, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Typography, Box, CircularProgress } from '@mui/material';
import useComicSearch from '../hooks/useComicSearch';

const RegisterPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    query, setQuery,
    searchResults,
    loading,
    selectedBook,
    hasSearched,
    characters,
    isCharacterLoading,
    selectedCharacters,
    handleSearch,
    handleSelectBook,
    handleCharacterClick,
    handleSave
  } = useComicSearch(navigate, location);

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
