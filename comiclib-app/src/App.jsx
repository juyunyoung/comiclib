import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Nevigation from './components/Nevigation';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import DetailPage from './pages/DetailPage';
import StatsPage from './pages/StatsPage';
import HomeDetail from './pages/HomeDetail';
import FourCutPage from './pages/FourCutPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Container sx={{ mt: 4, mb: 10, flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/detail/:id" element={<DetailPage />} />
            <Route path="/home-detail/:id" element={<HomeDetail />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/four-cut" element={<FourCutPage />} />
          </Routes>
        </Container>
        <Nevigation />
      </div>
    </Router>
  );
}

export default App;