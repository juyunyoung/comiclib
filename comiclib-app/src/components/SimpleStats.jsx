import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase';
import { Typography, Paper } from '@mui/material';
import { useTranslation } from '../context/LanguageContext';

const SimpleStats = () => {
  const [comicCount, setComicCount] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      const querySnapshot = await getDocs(collection(db, 'comics'));
      setComicCount(querySnapshot.size);
    };
    fetchStats();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">{t('stats.title')}</Typography>
      <Typography>{t('stats.total')}: {comicCount}</Typography>
    </Paper>
  );
};

export default SimpleStats;
