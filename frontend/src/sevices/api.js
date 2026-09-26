const API_BASE_URL = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5000/api';
localStorage.setItem('yukti_backend_url', import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || 'http://localhost:5000');

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('yukti_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`API unavailable at ${endpoint}. Using fallback UI logic.`, error);
    return null;
  }
};