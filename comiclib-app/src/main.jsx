import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UserProvider } from './context/UserContext';
import { AlertProvider } from './context/AlertContext';
import { LanguageProvider } from './context/LanguageContext';

import theme from './theme';

ReactDOM.createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <UserProvider>
      <AlertProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </AlertProvider>
    </UserProvider>
  </LanguageProvider>,
);
