import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import ProfilePage from './pages/ProfilePage';
import ConfirmationPage from './pages/ConfirmationPage';
import ChatExamples from './pages/ChatExamples';
import EnterEmailPage from './pages/EnterEmailPage'
import PWRecoveryPage from './pages/PWRecoveryPage'

function App() {
  return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/pages/ProfilePage" element={<ProfilePage />} />
      <Route path="/pages/ConfirmationPage/:token" element={<ConfirmationPage />} />
      <Route path="/pages/EnterEmailPage" element={<EnterEmailPage />} />
      <Route path="/pages/PWRecoveryPage/:token" element={<PWRecoveryPage />} />
      <Route path="/pages/ChatExamples" element={<ChatExamples />} />
      
    </Routes>
  </BrowserRouter>
);
}

export default App;



