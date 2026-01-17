import React, { useState } from 'react';
import ComicList from '../components/ComicList';
import EventList from '../components/EventList';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useTranslation } from '../context/LanguageContext';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newsQuery, setNewsQuery] = useState('');
  const { t } = useTranslation();

  const handleSearch = () => {
    setNewsQuery(searchTerm);
  };

  return (
    <div>
      <ComicList searchTerm={searchTerm} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          {t('home.title')}
        </Typography>
      </Box>
      <Box sx={{ my: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <TextField
          label={t('home.searchLabel')}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ width: '50%' }}
        />
        <Button variant="contained" onClick={handleSearch} size="large">
          {t('home.searchLabel') || '검색'}
        </Button>
      </Box>
      {/* Replaced SimpleStats with EventList */}
      <EventList query={newsQuery} />
    </div>
  );
};

export default HomePage;
