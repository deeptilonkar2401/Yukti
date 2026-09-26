import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Set up global fetch interceptor for React relative calls on production
const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
if (apiUrl) {
  localStorage.setItem('yukti_backend_url', apiUrl);
} else {
  localStorage.removeItem('yukti_backend_url');
}

const originalFetch = window.fetch;
window.fetch = function () {
  const args = Array.prototype.slice.call(arguments);
  if (typeof args[0] === 'string' && args[0].startsWith('/api/')) {
    if (apiUrl && apiUrl !== 'undefined' && apiUrl !== 'null') {
      args[0] = apiUrl + args[0];
    }
  }
  return originalFetch.apply(this, args);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);