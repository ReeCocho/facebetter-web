import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import ProfilePage from './pages/ProfilePage';
import ConfirmationPage from './pages/ConfirmationPage';

function App() {
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/pages/ProfilePage" element={<ProfilePage />} />
      <Route path="/pages/ConfirmationPage/:token" element={<ConfirmationPage />} />
      
    </Routes>
  </BrowserRouter>
);
}

export default App;



