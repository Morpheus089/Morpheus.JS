import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Loader from './backend/requette.jsx';
import Connexion from './web/jsx/connexion.jsx';
import Home from './web/jsx/home.jsx';

import './web/css/style2.css'; // Connexion
import './web/css/style3.css'; // Home

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Loader />} />
                <Route path="/connexion" element={<Connexion />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);