import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Paper, List, ListItem, IconButton, ListItemAvatar, Avatar, ListItemText, Rating, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import api from '../utils/api';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../context/LanguageContext';

const CharacterInfo = () => {
  const { t } = useTranslation();
  const { userId } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [rankedCharacters, setRankedCharacters] = useState([]);
  const [comicsList, setComicsList] = useState([]);
  const [tabValue, setTabValue] = useState(location.state?.activeTab || 0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('/search', { state: { query: searchQuery } });
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchCharacters();
    } else if (tabValue === 1) {
      fetchComics();
    }
  }, [tabValue, userId]);

  const fetchCharacters = async () => {
    try {
      const data = await api.get(`/api/comics/user-characters?user_id=${userId}`);

      const formattedData = data.map((item, index) => ({
        id: `char-${index}`,
        title: item.character_name,
        // Use photo_url if available, else comic cover, else placeholder
        coverImage: item.photo_url || item.comics?.coverImage || 'https://via.placeholder.com/150?text=No+Image',
        comicId: item.comics?.id,
        charId: item.character_id,
        affinity: item.affinity || 0,
        note: item.note
      }));

      setRankedCharacters(formattedData);
    } catch (error) {
      console.error("Error fetching characters:", error);
      setRankedCharacters([]);
    }
  };

  const fetchComics = async () => {
    try {
      const data = await api.get('/api/comics');
      setComicsList(data);
    } catch (error) {
      console.error("Error fetching comics:", error);
      setComicsList([]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && comicsList.length === 0) {
      fetchComics();
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 2 }}>
        {t('statsPage.title')}
      </Typography>

      <Box sx={{ mb: 0 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="stats tabs"
          sx={{
            '& .MuiTabs-indicator': {
              display: 'none', // Hide the default underline indicator
            },
            backgroundColor: 'primary.main',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            px: 2,
            pt: 1,
            minHeight: '48px'
          }}
        >
          <Tab
            label={t('statsPage.tabs.myFriends')}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              color: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px 12px 0 0',
              mr: 1,
              '&.Mui-selected': {
                color: 'primary.main',
                backgroundColor: 'background.paper',
              },
              '&:hover': {
                color: '#fff',
                opacity: 1,
              }
            }}
          />
          <Tab
            label={t('statsPage.tabs.myFriendsHouse')}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              color: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px 12px 0 0',
              '&.Mui-selected': {
                color: 'primary.main',
                backgroundColor: 'background.paper',
              },
              '&:hover': {
                color: '#fff',
                opacity: 1,
              }
            }}
          />
        </Tabs>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderTopLeftRadius: tabValue === 0 ? 0 : 12, // Curve only if first tab not active (hacky, better to just be square or consistent) - actually standard folder tabs usually have square connection or the content box has rounded corners everywhere except where the tab meets.
          // Let's keep it simple: The content box is white. The active tab is white. They merge.
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          backgroundColor: 'background.paper',
          mt: 0
        }}
      >

        {tabValue === 0 && (
          <List>
            {rankedCharacters.map((char, index) => (
              <Paper key={char.id} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }} elevation={1}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/detail/${char.charId}`, { state: { activeTab: tabValue, editMode: false } })}
                  secondaryAction={
                    <IconButton edge="end" aria-label="edit" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/detail/${char.charId}`, { state: { activeTab: tabValue, editMode: true } });
                    }}>
                      <EditIcon />
                    </IconButton>
                  }
                >

                  <ListItemAvatar sx={{ width: 75, height: 75, mr: 2 }}>
                    <Avatar
                      src={char.coverImage}
                      variant="rounded"
                      sx={{ width: 75, height: 75 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="div">
                        {char.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {/* Display Affinity (Ho-gam-do) */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                            {t('detailPage.affinity')}:
                          </Typography>
                          <Rating
                            value={char.affinity}
                            readOnly
                            size="small"
                            icon={<FavoriteIcon fontSize="inherit" color="error" />}
                            emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                          />
                        </Box>

                        {/* Display Note */}
                        {char.note && (
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'block', whiteSpace: 'pre-wrap' }}>
                            {char.note.length > 50 ? char.note.substring(0, 50) + '...' : char.note}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              </Paper>
            ))}
            {rankedCharacters.length === 0 && (
              <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                {t('statsPage.noCharacters')}
              </Typography>
            )}
          </List>
        )}

        {tabValue === 1 && (
          <List>
            {comicsList.map((comic) => (
              <Paper key={comic.id} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }} elevation={1}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/home-detail/${comic.id}`, { state: { editMode: false, data: comic, activeTab: tabValue } })}
                  secondaryAction={
                    <IconButton edge="end" aria-label="edit" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/home-detail/${comic.id}`, { state: { editMode: true, data: comic, activeTab: tabValue } });
                    }}>
                      <EditIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar sx={{ width: 60, height: 60, mr: 2 }}>
                    <Avatar
                      src={comic.coverImage}
                      variant="rounded"
                      sx={{ width: 60, height: 60 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="div">
                        {comic.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {comic.author}
                        </Typography>
                        <Rating value={comic.rating} readOnly size="small" />
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              </Paper>
            ))}
            {comicsList.length === 0 && (
              <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                {t('statsPage.noComics')}
              </Typography>
            )}
          </List>
        )}
      </Paper>
    </Box >
  );
};

export default CharacterInfo;
