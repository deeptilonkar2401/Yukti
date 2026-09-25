import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, isTokenValid } from '../context/AuthContext';

const ROLE_DEFAULT_REDIRECTS = {
  admin: '/admin-static/admin.html',
  administrator: '/admin-static/admin.html',
  government: '/admin-static/admin.html',
  gov: '/admin-static/admin.html',

  university: '/university/university.html',
  academic: '/university/university.html',

  industry: '/industry/industry.html',
  csr: '/industry/industry.html',

  citizen: '/citizen',
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuth();

  if (!user || !token || !isTokenValid(token)) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user.role || 'citizen').toLowerCase().trim();

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase().trim());
    if (!normalizedAllowed.includes(userRole)) {
      const redirectTarget = ROLE_DEFAULT_REDIRECTS[userRole] || '/login';
      if (redirectTarget.startsWith('/')) {
        if (redirectTarget.endsWith('.html')) {
          window.location.href = redirectTarget;
          return null;
        }
        return <Navigate to={redirectTarget} replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}