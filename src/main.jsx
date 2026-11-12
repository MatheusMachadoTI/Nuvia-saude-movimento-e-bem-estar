import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../css/base.css';
import '../css/inicio.css';
import '../css/treinos.css';
import '../css/evolucao.css';
import '../css/perfil.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
