import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../api/firebase';
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { useTranslation } from '../context/LanguageContext';

const CharacterRanking = ({ comicId }) => {
  const [characters, setCharacters] = useState([]);
  const [name, setName] = useState('');
  const [rank, setRank] = useState('');
  const [comment, setComment] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCharacters = async () => {
      const q = query(collection(db, 'characters'), where('comicId', '==', comicId));
      const querySnapshot = await getDocs(q);
      const chars = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCharacters(chars.sort((a, b) => a.rank - b.rank));
    };
    fetchCharacters();
  }, [comicId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'characters'), {
      comicId,
      name,
      rank: parseInt(rank),
      comment,
    });
    setName('');
    setRank('');
    setComment('');
    // Refetch characters
  };

  return (
    <div>
      <h3>{t('characterRanking.title')}</h3>
      <form onSubmit={handleSubmit}>
        <TextField label={t('characterRanking.nameLabel')} value={name} onChange={e => setName(e.target.value)} margin="normal" />
        <TextField label={t('characterRanking.rankLabel')} type="number" value={rank} onChange={e => setRank(e.target.value)} margin="normal" />
        <TextField label={t('characterRanking.commentLabel')} value={comment} onChange={e => setComment(e.target.value)} margin="normal" />
        <Button type="submit" variant="contained">{t('characterRanking.submit')}</Button>
      </form>
      <List>
        {characters.map(char => (
          <ListItem key={char.id}>
            <ListItemText primary={`${char.rank}. ${char.name}`} secondary={char.comment} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default CharacterRanking;
