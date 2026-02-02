import api from '../utils/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useAlert } from '../context/AlertContext';

const useComicSearch = (navigate, location) => {
  const { t } = useTranslation();
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [isCharacterLoading, setIsCharacterLoading] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (location?.state) {
      if (location.state.query) {
        setQuery(location.state.query);
        performSearch(location.state.query);
      } else if (location.state.editMode && location.state.data) {
        setIsEditMode(true);
        const { data } = location.state;
        setSelectedBook({
          title: data.title,
          author: data.author,
          description: '',
          rating: data.rating,
          review: data.review,
          image: data.coverImage,
          id: data.id,
          user_id: data.user_id,
        });
      }
    }
  }, [location?.state]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery) return;
    setLoading(true);
    setSearchResults([]);
    setSelectedCharacters([]);

    try {
      const data = await api.get(`/api/naver/search/book.json?query=${encodeURIComponent(searchQuery)}&display=5`);

      if (data.items && data.items.length > 0) {
        setSearchResults(data.items);
      } else {

        // Although this is a fallback, api.get will throw if it fails (not purely on 404 if API returns 200 with empty items, but typical fetch logic)
        // Game agent call:
        try {
          const gameData = await api.get(`/api/search/game?query=${encodeURIComponent(searchQuery)}`);
          if (gameData.items && gameData.items.length > 0) {
            setSearchResults(gameData.items);
          }
        } catch (e) {
          // Game agent failed, ignore or log

        }
      }
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleSearch = () => {
    performSearch(query);
  };

  const handleSelectBook = async (book) => {
    const cleanTitle = book.title.replace(/<[^>]+>/g, '');
    const cleanAuthor = book.author.replace(/<[^>]+>/g, '');
    const cleanDescription = book.description.replace(/<[^>]+>/g, '');

    setSelectedBook({
      title: cleanTitle,
      author: cleanAuthor,
      description: cleanDescription,
      image: book.image,
    });
    setSearchResults([]);

    setIsCharacterLoading(true);
    setCharacters([]);
    setSelectedCharacters([]);
    try {
      const data = await api.get(`/api/search/character?query=${encodeURIComponent(cleanTitle)}`);
      if (data.characters) {
        setCharacters(data.characters);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setIsCharacterLoading(false);
    }
  };

  const handleCharacterClick = (charName) => {
    setSelectedCharacters(prev => {
      if (prev.includes(charName)) {
        return prev.filter(name => name !== charName);
      } else {
        return [...prev, charName];
      }
    });
  };

  const handleSave = async (comicData) => {
    try {
      let imageUrl = comicData.coverImage;

      if (comicData.file instanceof File) {
        const formData = new FormData();
        formData.append('file', comicData.file);

        const uploadResult = await api.upload('/api/comics/upload', formData);
        imageUrl = uploadResult.url;
      }

      const result = await api.post('/api/comics', {
        ...comicData,
        coverImage: imageUrl,
        user_id: userId,
        file: undefined
      });

      if (result && selectedCharacters.length > 0) {
        const newComicId = Array.isArray(result) ? result[0]?.id : result?.id;

        if (newComicId) {
          try {
            const charPromises = selectedCharacters.map(charName =>
              api.post('/api/comics/character', {
                user_id: userId,
                comics_id: newComicId,
                character_name: charName,
                note: ''
              })
            );
            await Promise.all(charPromises);
          } catch (charError) {
            console.error('Error saving characters:', charError);
          }
        }
      }

      // Reset
      setQuery('');
      setSearchResults([]);
      setSelectedBook(null);
      setCharacters([]);
      setSelectedCharacters([]);
      setHasSearched(false);

      // Show success modal
      showAlert(isEditMode ? t('registerPage.updateSuccess') : t('registerPage.saveSuccess'), t('common.success'), 'success');

      // Determine the ID for redirection
      const savedId = Array.isArray(result) ? result[0]?.id : result?.id;

      // Navigate after a delay to let user see the modal?
      // Actually `showAlert` is non-blocking.
      if (savedId) {
        navigate(`/home-detail/${savedId}`);
      } else {
        navigate('/');
      }

      return true;

    } catch (error) {
      console.error("Save failed:", error);
      showAlert(`${t('registerPage.saveFail')}${error.message}`, t('common.error'), 'error');
      return false;
    }
  };

  return {
    query, setQuery,
    searchResults,
    loading,
    selectedBook, setSelectedBook, // Export setter to clean selection if needed
    hasSearched,
    characters,
    isCharacterLoading,
    selectedCharacters,
    isEditMode,
    handleSearch,
    handleSelectBook,
    handleCharacterClick,
    handleSave
  };
};

export default useComicSearch;
