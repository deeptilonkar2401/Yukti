import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  localStorage.setItem('yukti_backend_url', apiUrl);
} else {
  localStorage.removeItem('yukti_backend_url');
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);