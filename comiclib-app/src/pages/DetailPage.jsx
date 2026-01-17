import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CharacterRanking from '../components/CharacterRanking';
import { useTranslation } from '../context/LanguageContext';

const DetailPage = () => {
  const { id } = useParams();
  const [comic, setComic] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchComic = async () => {
      const docRef = doc(db, 'comics', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setComic({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchComic();
  }, [id]);

  if (!comic) {
    return <div>{t('detailPage.loading')}</div>;
  }

  return (
    <div>
      <h1>{comic.title}</h1>
      <p>{t('detailPage.author')}: {comic.author}</p>
      <p>{t('detailPage.rating')}: {comic.rating} / 5</p>
      <p>{t('detailPage.review')}: {comic.review}</p>
      <img src={comic.coverImage} alt={comic.title} style={{ width: '200px' }} />
      <CharacterRanking comicId={id} />
    </div>
  );
};

export default DetailPage;
