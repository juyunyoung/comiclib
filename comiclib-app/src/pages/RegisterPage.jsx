import React, { useState } from 'react';
import ComicForm from '../components/ComicForm';
import { useTranslation } from '../context/LanguageContext';
import { TextField, Button, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Typography, Box, CircularProgress } from '@mui/material';

const RegisterPage = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);

    try {
      // Use the proxy configured in vite.config.js
      const response = await fetch(`/api/naver/search/book.json?query=${encodeURIComponent(query)}&display=5`);
      const data = await response.json();
      if (data.items) {
        setSearchResults(data.items);
      }
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleSelectBook = (book) => {
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
  };

  return (
    <div>
      <h1>{t('registerPage.title')}</h1>

      <Box sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('home.searchLabel') || '친구 검색'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            id="book-search-query"
            name="book-search-query"
            label="제목 검색"
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
            {loading ? <CircularProgress size={24} /> : '검색'}
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
              검색된 내용이 없습니다.
            </Typography>
          )
        )}
      </Box>

      <ComicForm initialData={selectedBook} />
    </div>
  );
};

export default RegisterPage;
