import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lightbulb } from 'lucide-react';

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
  const location = useLocation();

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    setError('');
  };

function createMockJwt(userRole, userIdentifier) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: '1',
    id: 1,
    name: (userIdentifier && userIdentifier.includes('@') ? userIdentifier.split('@')[0] : userIdentifier) || `${userRole.toUpperCase()} User`,
    email: userIdentifier && userIdentifier.includes('@') ? userIdentifier : `${userIdentifier || userRole}@yukti.gov.in`,
    role: userRole,
    exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
  };

  const b64 = (obj) => {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    } catch (e) {
      return btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }
  };

  return `${b64(header)}.${b64(payload)}.mock_signature_bypass`;
}

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    const effectiveRole = (role || 'citizen').toLowerCase().trim();
    const mockToken = createMockJwt(effectiveRole, email);

    const loggedUser = {
      id: Math.floor(Math.random() * 1000) + 1,
      name: (email && !email.includes('@') ? email : `${effectiveRole.toUpperCase()} User`),
      role: effectiveRole,
      email: email && email.includes('@') ? email : `${email || effectiveRole}@yukti.gov.in`,
    };

    login(loggedUser, mockToken);

    try {
      localStorage.setItem('yukti_user', JSON.stringify(loggedUser));
      sessionStorage.setItem('yukti_user', JSON.stringify(loggedUser));
      localStorage.setItem('yukti_token', mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('access_token', mockToken);
      sessionStorage.setItem('yukti_token', mockToken);
      sessionStorage.setItem('token', mockToken);
      sessionStorage.setItem('access_token', mockToken);
    } catch (err) {
      console.warn('Storage persistence warning:', err);
    }

    setTimeout(() => {
      if (effectiveRole === 'admin') {
        navigate('/admin');
      } else if (effectiveRole === 'university') {
        navigate('/university');
      } else if (effectiveRole === 'industry') {
        navigate('/industry');
      } else {
        navigate('/citizen');
      }

      setLoading(false);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Creative Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 justify-center items-center">
        {/* Background Image & Overlay */}
        <img
          src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80"
          alt="Community Innovation"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 to-blue-900/90" />

        {/* Floating animated elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 px-12 max-w-lg">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight font-serif italic">
              "A problem shared<br />is a solution invited."
            </h2>
            <div className="w-12 h-1 bg-teal-400 rounded-full mb-6" />
            <p className="text-teal-50 text-lg font-medium leading-relaxed mb-8">
              Join India's largest community-driven innovation ecosystem. Connect with citizens, universities, and industry to build a better tomorrow.
            </p>

            {/* Quick stats/trust markers - purely visual for the login page */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div>
                <p className="text-3xl font-black text-white">2.8K+</p>
                <p className="text-xs font-semibold text-teal-200 uppercase tracking-wider mt-1">Problems Reported</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">340</p>
                <p className="text-xs font-semibold text-teal-200 uppercase tracking-wider mt-1">University Teams</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        {/* Subtle background element for mobile */}
        <div className="lg:hidden absolute top-[-20%] right-[-10%] w-[120%] h-[50%] bg-gradient-to-b from-teal-50 to-white rounded-full blur-3xl -z-10" />

        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-10">

          <div className="text-center mb-8">
            <div className="inline-flex justify-center items-center mb-4 mt-2">
              <img src="/logo-transparent.png" alt="YUKTI Logo" className="h-20 w-auto mx-auto drop-shadow-lg" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-sm font-medium text-slate-500 mt-2">Sign in to the YUKTI Collaboration Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={handleRoleChange}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none bg-slate-50 transition-colors cursor-pointer"
                >
                  <option value="admin">District/Government Admin</option>
                  <option value="university">University Dean/Faculty</option>
                  <option value="industry">Industry/CSR Partner</option>
                  <option value="citizen">Citizen Representative</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Username / Email (Any)</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter any username or email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50 placeholder:text-slate-400 transition-colors outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password (Any)</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter any password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50 placeholder:text-slate-400 transition-colors outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs font-bold text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 flex justify-center items-center"
            >
              Sign In
            </button>

            {/* PRESENTATION DEMO BUTTONS */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <p className="text-center text-xs font-black uppercase text-amber-600 tracking-wider">Fast Demo Accounts (One-Click)</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { login({ name: 'State Nodal Officer', role: 'admin', email: 'admin@yukti.gov.in' }, 'demo-token'); navigate('/admin'); }} className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 rounded-lg text-xs transition">
                  Login as Admin
                </button>
                <button type="button" onClick={() => { login({ name: 'Birsa University Lead', role: 'university', email: 'dean@birsa.edu' }, 'demo-token'); navigate('/university'); }} className="py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 rounded-lg text-xs transition">
                  Login as University
                </button>
                <button type="button" onClick={() => { login({ name: 'Tata Steel CSR', role: 'industry', email: 'csr@tata.com' }, 'demo-token'); navigate('/industry'); }} className="py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold border border-pink-200 rounded-lg text-xs transition">
                  Login as Industry
                </button>
                <button type="button" onClick={() => { login({ name: 'Ravi Kumar', role: 'citizen', email: 'citizen@mail.com' }, 'demo-token'); navigate('/citizen'); }} className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 rounded-lg text-xs transition">
                  Login as Citizen
                </button>
              </div>
            </div>
          </form>

          <p className="text-center text-sm font-medium text-slate-500 mt-8 pt-8 border-t border-slate-100">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="font-bold text-teal-600 hover:text-teal-700 transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
