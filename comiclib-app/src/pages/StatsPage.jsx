import React, { useEffect, useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box, Rating, Paper } from '@mui/material';

const StatsPage = () => {
  const { t } = useTranslation();
  const [rankedCharacters, setRankedCharacters] = useState([]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        // Fetching real data
        const q = query(collection(db, 'comics'), orderBy('rating', 'desc'));
        const querySnapshot = await getDocs(q);
        const characters = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Use Mock Data if no real data found OR to satisfy "Show mock data" request
        // Since the user explicitly asked to SHOW mock data, I will append/use it.
        const mockData = Array.from({ length: 10 }, (_, i) => ({
          id: `mock-${i}`,
          title: `Character ${i + 1}`,
          author: `Comic Series ${i + 1}`,
          rating: 5 - (i % 3) * 0.5, // 5, 4.5, 4, 5, ...
          coverImage: `https://via.placeholder.com/150?text=Char+${i + 1}`,
          description: 'Mock description for character ranking display.'
        }));

        if (characters.length > 0) {
          setRankedCharacters(characters);
        } else {
          setRankedCharacters(mockData);
        }
        // For demonstration purposes, if you want ONLY mock data regardless of DB, uncomment below:
        // setRankedCharacters(mockData); 
      } catch (error) {
        console.error("Error fetching characters:", error);
        // Fallback to mock data on error
        const mockData = Array.from({ length: 10 }, (_, i) => ({
          id: `mock-${i}`,
          title: `Character ${i + 1}`,
          author: `Comic Series ${i + 1}`,
          rating: 5 - (i % 3) * 0.5,
          coverImage: `https://via.placeholder.com/150?text=Char+${i + 1}`
        }));
        setRankedCharacters(mockData);
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
