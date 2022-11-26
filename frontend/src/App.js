import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from './pages/LoginPage';
import CardPage from './pages/CardPage';
import HomePage from './pages/HomePage';
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
      <Route path="/pages/HomePage" element={<HomePage />} />
      <Route path="/pages/Followers" element={<HomePage/>} />
      <Route path="/pages/Following" element={<HomePage/>} />
      <Route path="/components/Profile" element={<HomePage/>} />
      <Route path="/pages/Chats" element={<HomePage/>} />
      <Route path="/components/Edit" element={<HomePage/>} />
      <Route path="/components/Home" element={<HomePage/>} />
      <Route path="/components/Home/Search" element={<HomePage/>} />
      <Route path="/pages/ProfilePage" element={<ProfilePage />} />
      <Route path="/pages/ConfirmationPage/:token" element={<ConfirmationPage />} />
      <Route path="/pages/EnterEmailPage" element={<EnterEmailPage />} />
      <Route path="/pages/PWRecoveryPage/:token" element={<PWRecoveryPage />} />
      <Route path="/pages/ChatExamples" element={<ChatExamples />} />
      <Route path="/components/User" element={<HomePage />} />
\      
    </Routes>
  </BrowserRouter>
);
}

export default App;



