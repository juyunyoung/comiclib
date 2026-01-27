import React, { useState } from 'react';
import ComicList from '../components/ComicList';
import EventList from '../components/EventList';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useTranslation } from '../context/LanguageContext';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div>
      <ComicList searchTerm="" />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          {t('home.title')}
        </Typography>
      </Box>

      <EventList />
    </div>
  );
};

export default HomePage;
