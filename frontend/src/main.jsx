import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Register backend URL from Vite environment variable (set during Render build)
const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
if (apiUrl && apiUrl !== 'undefined' && apiUrl !== 'null') {
  if (typeof window.setYuktiBackendUrl === 'function') {
    window.setYuktiBackendUrl(apiUrl);
  } else {
    window.YUKTI_BACKEND_URL = apiUrl.replace(/\/+$/, '');
    try {
      localStorage.setItem('yukti_backend_url', apiUrl.replace(/\/+$/, ''));
    } catch (e) {}
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);