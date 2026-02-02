import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Container, CircularProgress, Box } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';

import Navigation from './components/Navigation';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const HomeDetail = lazy(() => import('./pages/HomeDetail'));
const CharacterInfo = lazy(() => import('./pages/CharacterInfo'));
const FourCutPage = lazy(() => import('./pages/FourCutPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

function AppContent() {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container sx={{ mt: 4, mb: 10, flex: 1 }}>
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          }>
            <Routes>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<Navigate to="/register" replace />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/detail/:id" element={<DetailPage />} />
              <Route path="/home-detail/:id" element={<HomeDetail />} />
              <Route path="/stats" element={<CharacterInfo />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/four-cut" element={<FourCutPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Container>
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;