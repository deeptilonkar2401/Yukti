import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return true;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('yukti_token') || sessionStorage.getItem('yukti_token') || null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('yukti_user') || sessionStorage.getItem('yukti_user');
    const parsedUser = saved ? JSON.parse(saved) : null;
    const currentToken = localStorage.getItem('yukti_token') || sessionStorage.getItem('yukti_token');
    
    if (parsedUser && isTokenValid(currentToken)) {
      return parsedUser;
    }
    return null;
  });

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);

    localStorage.setItem('yukti_user', JSON.stringify(userData));
    sessionStorage.setItem('yukti_user', JSON.stringify(userData));

    if (jwtToken) {
      localStorage.setItem('yukti_token', jwtToken);
      sessionStorage.setItem('yukti_token', jwtToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('yukti_user');
    localStorage.removeItem('yukti_token');
    sessionStorage.removeItem('yukti_user');
    sessionStorage.removeItem('yukti_token');
  };

  useEffect(() => {
    if (token && !isTokenValid(token)) {
      logout();
    }
  }, [token]);

  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    // In open/demo access mode, do not auto-logout if an endpoint returns 401/403
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, fetchWithAuth, isTokenValid: () => isTokenValid(token) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);