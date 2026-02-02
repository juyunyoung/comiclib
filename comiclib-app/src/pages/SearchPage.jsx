import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ComicForm from '../components/ComicForm';
import { useTranslation } from '../context/LanguageContext';
import { TextField, Button, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Typography, Box, CircularProgress } from '@mui/material';
import useComicSearch from '../hooks/useComicSearch';

const SearchPage = () => {
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
    isEditMode,
    handleSearch,
    handleSelectBook,
    handleCharacterClick,
    handleSave
  } = useComicSearch(navigate, location);

  return (
    <div>
      <h1>{isEditMode ? (t('statsPage.editTitle') || "Edit Friend's House") : (t('searchPage.title') || 'Search Friends')}</h1>

      {!isEditMode && (
        <Box sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('home.searchLabel') || '친구 검색'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              id="book-search-query"
              name="book-search-query"
              label="제목으로 검색"
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
      )}

      <Box sx={{ mt: 4 }}>
        {isCharacterLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>캐릭터 정보 찾는 중...</Typography>
          </Box>
        ) : characters.length > 0 ? (
          <Box>
            <Typography variant="h6" gutterBottom>등장 캐릭터 (클릭하여 선택)</Typography>
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

      <ComicForm initialData={selectedBook} onSubmit={handleSave} submitLabel={isEditMode ? "친구집 수정" : "친구집 추가"} />
    </div>
  );
};

export default SearchPage;
