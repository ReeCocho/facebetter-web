import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import HomePage from './pages/HomePage';

function App() {
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/pages/HomePage" element={<HomePage />} />
      <Route path="/pages/Followers" element={<HomePage/>} />
      <Route path="/pages/Following" element={<HomePage/>} />
      <Route path="/components/Profile" element={<HomePage/>} />
      <Route path="/pages/Chats" element={<HomePage/>} />
      
    </Routes>
  </BrowserRouter>
);
}

export default App;



