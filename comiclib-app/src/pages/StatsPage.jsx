import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box, Rating, Paper, Tabs, Tab, IconButton, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const StatsPage = () => {
  const { t } = useTranslation();
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
  }, [tabValue]);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/comics/user-characters?user_id=juyunyoung');

      if (!response.ok) {
        throw new Error('Failed to fetch user characters');
      }

      const data = await response.json();

      const formattedData = data.map((item, index) => ({
        id: `char-${index}`,
        title: item.charactor_name,
        author: item.comics?.title || 'Unknown Comic',
        rating: item.comics?.rating || 0,
        coverImage: item.comics?.coverImage || 'https://via.placeholder.com/150?text=No+Image',
        comicId: item.comics?.id
      }));

      setRankedCharacters(formattedData);
    } catch (error) {
      console.error("Error fetching characters:", error);
      setRankedCharacters([]);
    }
  };

  const fetchComics = async () => {
    try {
      const response = await fetch('/api/comics');

      if (!response.ok) {
        throw new Error('Failed to fetch comics');
      }

      const data = await response.json();
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
                  secondaryAction={
                    <IconButton edge="end" aria-label="edit" onClick={() => navigate(`/detail/${char.comicId}`, { state: { activeTab: tabValue } })}>
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
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {char.author}
                        </Typography>
                        <Rating value={char.rating} readOnly size="small" />
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              </Paper>
            ))}
            {rankedCharacters.length === 0 && (
              <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                No characters registered yet.
              </Typography>
            )}
          </List>
        )}

        {tabValue === 1 && (
          <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={t('home.searchLabel') || "Search..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="contained" onClick={handleSearch} disabled={!searchQuery.trim()}>
                {t('home.searchLabel') || "Search"}
              </Button>
            </Box>
            <List>
              {comicsList.map((comic) => (
                <Paper key={comic.id} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }} elevation={1}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      <IconButton edge="end" aria-label="edit" onClick={() => navigate(`/home-detail/${comic.id}`, { state: { editMode: true, data: comic, activeTab: tabValue } })}>
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
                  No comics found.
                </Typography>
              )}
            </List>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default StatsPage;
