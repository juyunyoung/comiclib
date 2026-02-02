import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, ButtonGroup, Tooltip, Box } from '@mui/material';
import { useTranslation } from '../context/LanguageContext';

const Navigation = () => {
  const { t, language, setLanguage } = useTranslation();

  return (
    <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', flex: 1 }}>
          <Tooltip title={t('nevigation.register')}>
            <Button color="inherit" component={Link} to="/register" sx={{ flex: 1, p: 1 }}>
              <img src="/icons/add.png" alt="Add" style={{ height: '40px', width: 'auto' }} />
            </Button>
          </Tooltip>
          <Tooltip title={t('nevigation.home')}>
            <Button color="inherit" component={Link} to="/" sx={{ flex: 1, p: 1 }}>
              <img src="/icons/home.png" alt="Home" style={{ height: '40px', width: 'auto' }} />
            </Button>
          </Tooltip>

          <Tooltip title={t('nevigation.stats')}>
            <Button color="inherit" component={Link} to="/stats" sx={{ flex: 1, p: 1 }}>
              <img src="/icons/stats.png" alt="Stats" style={{ height: '40px', width: 'auto' }} />
            </Button>
          </Tooltip>
          <Tooltip title={t('nevigation.fourCut')}>
            <Button color="inherit" component={Link} to="/four-cut" sx={{ flex: 1, p: 1 }}>
              <img src="/icons/camera.png" alt="4-Cut" style={{ height: '40px', width: 'auto' }} />
            </Button>
          </Tooltip>
        </Box>
        <ButtonGroup variant="outlined" color="inherit" size="small" sx={{ ml: 2, borderColor: 'rgba(255,255,255,0.5)' }}>
          <Button
            onClick={() => setLanguage('ko')}
            disabled={language === 'ko'}
            sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.5)' }}
          >
            KO
          </Button>
          <Button
            onClick={() => setLanguage('en')}
            disabled={language === 'en'}
            sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.5)' }}
          >
            EN
          </Button>
        </ButtonGroup>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
