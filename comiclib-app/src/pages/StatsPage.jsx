import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box, Rating, Paper } from '@mui/material';

const StatsPage = () => {
  const { t } = useTranslation();
  const [rankedCharacters, setRankedCharacters] = useState([]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/comics/user-characters?user_id=juyunyoung');

        if (!response.ok) {
          throw new Error('Failed to fetch user characters');
        }

        const data = await response.json();

        // Map backend response to frontend structure
        // Backend: { charactor_name, comics: { title, rating, coverImage } }
        // Frontend: { id, title (char name), author (comic title), rating, coverImage }
        const formattedData = data.map((item, index) => ({
          id: `char-${index}`,
          title: item.charactor_name,
          author: item.comics?.title || 'Unknown Comic',
          rating: item.comics?.rating || 0,
          coverImage: item.comics?.coverImage || 'https://via.placeholder.com/150?text=No+Image'
        }));

        setRankedCharacters(formattedData);
      } catch (error) {
        console.error("Error fetching characters:", error);
        // Fallback to empty list or handle error appropriately
        setRankedCharacters([]);
      }
    };

    fetchCharacters();
  }, []);

  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        {t('statsPage.title')}
      </Typography>

      <List>
        {rankedCharacters.map((char, index) => (
          <Paper key={char.id} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }} elevation={1}>
            <ListItem alignItems="flex-start">
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, minWidth: 30 }}>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  #{index + 1}
                </Typography>
              </Box>
              <ListItemAvatar sx={{ width: 60, height: 60, mr: 2 }}>
                <Avatar
                  src={char.coverImage}
                  variant="rounded"
                  sx={{ width: 60, height: 60 }}
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
              />
            </ListItem>
          </Paper>
        ))}
      </List>

      {rankedCharacters.length === 0 && (
        <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
          No characters registered yet.
        </Typography>
      )}
    </Box>
  );
};

export default StatsPage;
