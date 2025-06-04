import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Loader from './backend/requette.jsx';       // logique avec timer
import Connexion from './web/jsx/connexion.jsx';   // ta page suivante

import './web/css/style2.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Loader />} />
                <Route path="/connexion" element={<Connexion />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);