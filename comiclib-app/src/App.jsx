import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Nevigation from './components/Nevigation';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import DetailPage from './pages/DetailPage';
import StatsPage from './pages/StatsPage';
import FourCutPage from './pages/FourCutPage';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Container sx={{ mt: 4, mb: 10, flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/detail/:id" element={<DetailPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/four-cut" element={<FourCutPage />} />
          </Routes>
        </Container>
        <Nevigation />
      </div>
    </Router>
  );
}

export default App;