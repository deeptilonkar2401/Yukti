import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const ROLE_EMAIL_RULES = {
  admin: {
    pattern: /@.*\.(gov\.in|nic\.in)$/i,
    hint: 'a government email ending in .gov.in or .nic.in',
  },
  university: {
    pattern: /@.*\.(ac\.in|edu)$/i,
    hint: 'a university email ending in .ac.in or .edu',
  },
  csr: {
    pattern: /^(?!.*@.*\.(gov\.in|nic\.in|ac\.in|edu)$).+$/i,
    hint: 'an organization email (not a .gov.in / .ac.in / .edu address)',
  },
  citizen: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    hint: 'a valid email address',
  },
};

const BASIC_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include a number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a special character.';
  return null;
}

// ── React-routed roles (navigate() se andar hi rahenge, reload nahi hoga) ──
const ROLE_REDIRECTS = {
  citizen: '/citizen', // citizenlandingpage.jsx
};

// ── Static HTML dashboards (public/ folder se serve honge) ─────────────────
const STATIC_REDIRECTS = {
  admin: '/admin-static/admin.html',
  administrator: '/admin-static/admin.html',
  government: '/admin-static/admin.html',
  gov: '/admin-static/admin.html',
  
  university: '/university/university.html',
  universities: '/university/university.html',
  academic: '/university/university.html',
  institute: '/university/university.html',
  
  industry: '/industry/industry.html',
  industries: '/industry/industry.html',
  csr: '/industry/industry.html',
  corporate: '/industry/industry.html',
  company: '/industry/industry.html',
};

export default function Login() {
  const [role, setRole] = useState('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!BASIC_EMAIL.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.detail || 'User not registered or invalid password. Please sign up first.');
        setLoading(false);
        return;
      }

      // Login successful — save user & token
      const token = data.access_token;
      const userRoleFromBackend = data.user?.role?.toString().toLowerCase().trim();
      const selectedRoleFromForm = role?.toString().toLowerCase().trim();

      const effectiveRole = userRoleFromBackend || selectedRoleFromForm || 'citizen';

      const loggedUser = {
        id: data.user?.id,
        name: data.user?.name || 'User',
        role: effectiveRole,
        email: data.user?.email || email,
      };

      login(loggedUser, token);

      // Priority 1: Check backend user role in static redirects
      // Priority 2: Check form selected role in static redirects
      const targetPath = STATIC_REDIRECTS[userRoleFromBackend] || STATIC_REDIRECTS[selectedRoleFromForm];

      if (targetPath) {
        window.location.href = targetPath;
      } else {
        navigate(ROLE_REDIRECTS[effectiveRole] || '/citizen');
      }
    } catch (err) {
      setError('Could not connect to backend server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-card rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <Shield className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-mainText">Portal Login</h1>
          <p className="text-xs text-subText">Access YUKTI Pipeline & Collaboration Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-mainText mb-1">Select Role</label>
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-mainText text-sm bg-white"
            >
              <option value="admin">District/Government Admin</option>
              <option value="university">University Dean/Faculty</option>
              <option value="industry">Industry/CSR Partner</option>
              <option value="citizen">Citizen Representative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-mainText mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@yukti.gov.in"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-mainText text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-mainText mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 text-mainText text-sm"
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-indigo-900 text-white font-bold py-2.5 rounded-lg transition text-sm disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>



        <p className="text-center text-xs text-subText">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
