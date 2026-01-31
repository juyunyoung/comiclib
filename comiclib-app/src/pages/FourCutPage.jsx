import React, { useState } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, TextField } from '@mui/material';
import { useTranslation } from '../context/LanguageContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import heic2any from 'heic2any';

const FourCutPage = () => {
  const { t } = useTranslation();
  const [myPhoto, setMyPhoto] = useState(null);
  const [charPhoto, setCharPhoto] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [resultText, setResultText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keyword1, setKeyword1] = useState('');
  const [keyword2, setKeyword2] = useState('');

  // Helper to convert file to base64
  const fileToGenerativePart = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /* State for character selection */
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState('');

  // Fetch characters on mount
  React.useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/comics/user-characters?user_id=juyunyoung');
        if (response.ok) {
          const data = await response.json();
          console.log(data.length);
          setCharacters(data);
        }
      } catch (error) {
        console.error("Failed to fetch characters:", error);
      }
    };
    fetchCharacters();
  }, []);

  const handleGenerate = async () => {
    if (!myPhoto || !charPhoto) {
      alert(t('fourCutPage.alertBothPhotos'));
      return;
    }

    setLoading(true);
    setError(null);
    setResultImage(null);
    setResultText(null);

    try {
      const formData = new FormData();
      formData.append('image1', myPhoto);
      formData.append('image2', charPhoto);
      formData.append('keyword1', keyword1 || '어깨동무');
      formData.append('keyword2', keyword2 || '환하게 웃는');

      // Call the comiclib-api backend
      const response = await fetch('/api/makePhoto', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.image) {
        // The backend returns a base64 string in 'image' field
        setResultImage(`data:image/jpeg;base64,${result.image}`);
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        throw new Error("Unknown response format from server");
      }

    } catch (err) {
      console.error("AI Generation Error:", err);
      setError(err.message || t('fourCutPage.generateError'));
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resultImage) return;

    if (!selectedCharacter) {
      alert(t('fourCutPage.alertSelectCharacter'));
      return;
    }

    // resultImage is either a URL "http..." or Data URI "data:image/..."
    let photoData = resultImage;
    if (resultImage.startsWith('data:')) {
      photoData = resultImage.split(',')[1];
    }

    try {
      const response = await fetch('/api/comics/photo-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedCharacter,
          photo_base64: photoData,
          keyword1: keyword1,
          keyword2: keyword2
        }),
      });

      if (response.ok) {
        alert(t('fourCutPage.saveSuccess'));
      } else {
        const errText = await response.text();
        alert(`${t('fourCutPage.saveFail')}${errText}`);
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert(t('fourCutPage.saveError'));
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  // Keep the old helper for compatibility if needed or remove it.
  // The SDK used `fileToGenerativePart` which did something similar.
  /* 
  const fileToGenerativePart = async (file) => { ... } 
  */

  const PhotoUpload = ({ label, file, setFile }) => (
    <Box sx={{ mb: 3, textAlign: 'center' }}>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        {label}
      </Typography>
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          height: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          overflow: 'hidden',
          mb: 1,
          border: '2px dashed #ccc'
        }}
      >
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Typography color="text.secondary">{t('fourCutPage.noImage')}</Typography>
        )}
      </Paper>
      <Button variant="contained" component="label" fullWidth>
        {t('fourCutPage.selectPhoto')}
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={async (e) => {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
              if (selectedFile.type === 'image/heic' || selectedFile.name.toLowerCase().endsWith('.heic')) {
                try {
                  const result = await heic2any({ blob: selectedFile, toType: 'image/jpeg' });
                  const convertedBlob = Array.isArray(result) ? result[0] : result;
                  const convertedFile = new File(
                    [convertedBlob],
                    selectedFile.name.replace(/\.heic$/i, '.jpg'),
                    { type: 'image/jpeg' }
                  );
                  setFile(convertedFile);
                  return;
                } catch (error) {
                  console.error('HEIC conversion failed:', error);
                  alert(t('fourCutPage.errorHeic'));
                  return;
                }
              }

              if (!selectedFile.type.startsWith('image/')) {
                alert(t('fourCutPage.errorImageFormat'));
                return;
              }
              setFile(selectedFile);
            }
          }}
        />
      </Button>
    </Box>
  );

  return (
    <Box sx={{ pb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        {t('fourCutPage.title')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ flex: 1 }}>
          <PhotoUpload
            label={t('fourCutPage.myPhoto')}
            file={myPhoto}
            setFile={setMyPhoto}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <PhotoUpload
            label={t('fourCutPage.charPhoto')}
            file={charPhoto}
            setFile={setCharPhoto}
          />
        </Box>
      </Box>

      {/* Keyword Inputs */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          label={t('fourCutPage.keyword1Label')}
          placeholder={t('fourCutPage.keyword1Placeholder')}
          fullWidth
          value={keyword1}
          onChange={(e) => setKeyword1(e.target.value)}
        />
        <TextField
          label={t('fourCutPage.keyword2Label')}
          placeholder={t('fourCutPage.keyword2Placeholder')}
          fullWidth
          value={keyword2}
          onChange={(e) => setKeyword2(e.target.value)}
        />
      </Box>

      {/* Character Selection */}
      <Box sx={{ mb: 4 }}>
        <TextField
          select
          label={t('fourCutPage.selectCharacterLabel')}
          value={selectedCharacter}
          onChange={(e) => setSelectedCharacter(e.target.value)}
          fullWidth
          SelectProps={{
            native: true,
          }}
          InputLabelProps={{
            shrink: true,
          }}
          helperText={t('fourCutPage.helperText')}
        >
          <option value="">{t('fourCutPage.defaultOption')}</option>
          {characters.map((char) => (
            <option key={char.character_id} value={char.character_id}>
              {char.character_name} ({char.comics?.title || 'Unknown Comic'})
            </option>
          ))}
        </TextField>
      </Box>

      <Button
        variant="contained"
        color="secondary"
        size="large"
        fullWidth
        sx={{ mt: 2, mb: 4, py: 2, fontSize: '1.2rem', fontWeight: 'bold' }}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : t('fourCutPage.generate')}
      </Button>

      {error && (
        <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      {resultImage && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            {t('fourCutPage.result')}
          </Typography>
          <Paper elevation={3} sx={{ p: 2, display: 'inline-block' }}>
            <img src={resultImage} alt="Result" style={{ maxWidth: '100%', maxHeight: 400 }} />
          </Paper>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
            >
              {t('fourCutPage.saveImage')}
            </Button>
          </Box>
        </Box>
      )}

      {resultText && !resultImage && (
        <Box sx={{ mt: 4, textAlign: 'center', px: 2 }}>
          <Typography variant="h5" gutterBottom>
            {t('fourCutPage.result')}
          </Typography>
          <Paper elevation={3} sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {resultText}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default FourCutPage;
