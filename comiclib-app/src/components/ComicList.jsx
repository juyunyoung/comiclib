import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Card, CardActionArea, CardMedia, CardContent, Typography, Rating } from '@mui/material';
import api from '../utils/api';
import { useTranslation } from '../context/LanguageContext';

const ComicList = ({ searchTerm }) => {
  const [comics, setComics] = useState([]);
  const [filteredComics, setFilteredComics] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const comicsData = await api.get('/api/comics');
        setComics(Array.isArray(comicsData) ? comicsData : []);
      } catch (error) {
        console.error("Failed to fetch comics:", error);
      }
    };
    fetchComics();
  }, []);

  useEffect(() => {
    if (searchTerm && Array.isArray(comics)) {
      const results = comics.filter(comic =>
        comic.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredComics(results);
    } else {
      setFilteredComics(comics);
    }
  }, [searchTerm, comics]);

  return (
    <Grid container spacing={3}>
      {filteredComics.map(comic => (
        <Grid item key={comic.id} xs={12} sm={6} md={4} lg={3}>
          <Card>
            <CardActionArea component={Link} to={`/detail/${comic.id}`}>
              <CardMedia
                component="img"
                height="250"
                image={comic.coverImage || 'https://via.placeholder.com/200x300'}
                alt={comic.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {comic.title}
                </Typography>
                <Rating value={comic.rating} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {comic.review}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ComicList;
