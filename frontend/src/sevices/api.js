const configuredBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
if (configuredBase && configuredBase !== 'undefined' && configuredBase !== 'null') {
  try {
    localStorage.setItem('yukti_backend_url', configuredBase.replace(/\/+$/, ''));
  } catch (e) {}
}
const API_BASE_URL = configuredBase ? (configuredBase.replace(/\/+$/, '') + '/api') : '/api';

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