import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ChatHome from './pages/ChatHome';

function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" index element={<ChatHome />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;