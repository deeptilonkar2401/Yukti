import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DOMAIN_OPTIONS = [
  { value: 'water_management', label: 'Water Management' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'renewable_energy', label: 'Renewable Energy' },
  { value: 'waste_management', label: 'Waste Management' },
  { value: 'education', label: 'Education' },
  { value: 'disaster_management', label: 'Disaster Management' },
];

const SECTOR_OPTIONS = [
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'it_software', label: 'IT / Software' },
  { value: 'mining_metals', label: 'Mining & Metals' },
  { value: 'energy', label: 'Energy' },
  { value: 'agriculture_processing', label: 'Agriculture Processing' },
  { value: 'healthcare_pharma', label: 'Healthcare & Pharma' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

const ROLE_META = {
  citizen: { icon: '👤', label: 'Citizen', nameLabel: 'Full Name', namePlaceholder: 'Your full name' },
  university: { icon: '🎓', label: 'University', nameLabel: 'Institute Name', namePlaceholder: 'e.g. XYZ Institute of Technology' },
  industry: { icon: '🏭', label: 'Industry', nameLabel: 'Company Name', namePlaceholder: 'e.g. XYZ Pvt. Ltd.' },
};

const inputClass =
  'w-full px-4 py-2.5 rounded-lg bg-[#0f172a]/80 border border-[#1e293b] text-white text-sm outline-none focus:border-[#00d2ff] focus:shadow-[0_0_10px_rgba(0,210,255,0.3)] transition';
const labelClass = 'block text-sm font-medium text-[#cbd5e1] mb-1.5';

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // citizen
  const [citizenState, setCitizenState] = useState('');
  const [citizenIdOptional, setCitizenIdOptional] = useState('');

  // university
  const [affiliationId, setAffiliationId] = useState('');
  const [contactDesignation, setContactDesignation] = useState('');
  const [domains, setDomains] = useState([]);
  const [universityWebsite, setUniversityWebsite] = useState('');

  // industry
  const [sector, setSector] = useState('');
  const [gstin, setGstin] = useState('');
  const [csrFocus, setCsrFocus] = useState('');
  const [industryContactDesignation, setIndustryContactDesignation] = useState('');

  const toggleDomain = (value) => {
    setDomains((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    let profile = { city };
    if (role === 'citizen') {
      profile = { ...profile, state: citizenState, id_number: citizenIdOptional };
    } else if (role === 'university') {
      profile = {
        ...profile,
        affiliation_id: affiliationId,
        contact_designation: contactDesignation,
        domains,
        website: universityWebsite,
      };
    } else if (role === 'industry') {
      profile = {
        ...profile,
        sector,
        gstin,
        csr_focus_area: csrFocus,
        contact_designation: industryContactDesignation,
      };
    }

    const payload = { name, email, phone, password, role, profile };

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.detail || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      if (role === 'citizen') {
        alert('Account created! You can log in now.');
      } else {
        alert('Account created! It is pending admin verification before you can log in.');
      }
      navigate('/login');
    } catch (err) {
      setError('Could not reach the server. Please try again.');
      setLoading(false);
    }
  };

  const meta = ROLE_META[role];

  return (
    <div className="min-h-screen w-full flex bg-[#080d1a]">

      {/* LEFT — brand panel, hidden on small screens */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-16">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, rgba(0,210,255,0.18), transparent 55%), linear-gradient(160deg, #050b18 0%, #0b1633 55%, #0f172a 100%)',
          }}
        />
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center bg-white px-3 py-2 rounded-lg shadow-lg">
            <img src="/Yuktilogo.jpeg" alt="YUKTI" className="h-[500px] w-auto object-contain" />
          </div>
          <h1 className="mt-10 text-3xl font-bold text-white leading-snug">
            Bring your problem, your expertise, or your resources —
            YUKTI connects them.
          </h1>
          <p className="mt-4 text-[#94a3b8] text-sm leading-relaxed">
            Citizens report real issues. Universities and industry
            partners bring the people and resources to solve them.
          </p>
        </div>
      </div>

      {/* RIGHT — signup card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          <div className="lg:hidden flex justify-center mb-8">
            <div className="inline-flex items-center bg-white px-3 py-2 rounded-lg shadow-lg">
              <img src="/Yuktilogo.jpeg" alt="YUKTI" className="h-[108px] w-auto object-contain" />
            </div>
          </div>

          <div className="bg-[#0f172a]/75 backdrop-blur-xl border border-[#00d2ff]/20 rounded-2xl shadow-[0_10px_30px_rgba(0,210,255,0.15)] p-9">
            <h2 className="text-center text-2xl font-bold bg-gradient-to-r from-[#00d2ff] to-[#0052cc] bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-center text-sm text-[#94a3b8] mt-1 mb-7">
              Join YUKTI as a Citizen, University or Industry partner
            </p>

            {/* ROLE SELECTOR */}
            <div className="flex gap-2.5 mb-7">
              {Object.entries(ROLE_META).map(([key, r]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-lg border text-xs font-semibold transition ${role === key
                    ? 'bg-gradient-to-r from-[#0052cc]/40 to-[#00d2ff]/20 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                    : 'bg-[#0f172a]/80 border-[#1e293b] text-[#cbd5e1] hover:border-[#00d2ff]/40 hover:text-white'
                    }`}
                >
                  <span className="text-xl">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{meta.nameLabel}</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder={meta.namePlaceholder} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City / District</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                </div>
              </div>

              {/* CITIZEN FIELDS */}
              {role === 'citizen' && (
                <div className="bg-[#080d1a]/50 border border-[#1e293b] rounded-lg p-4 space-y-4">
                  <h3 className="text-[#38bdf8] text-sm font-semibold">Citizen Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>State</label>
                      <input value={citizenState} onChange={(e) => setCitizenState(e.target.value)}
                        placeholder="e.g. Jharkhand" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Aadhaar / ID Number (optional)</label>
                      <input value={citizenIdOptional} onChange={(e) => setCitizenIdOptional(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
              )}

              {/* UNIVERSITY FIELDS */}
              {role === 'university' && (
                <div className="bg-[#080d1a]/50 border border-[#1e293b] rounded-lg p-4 space-y-4">
                  <h3 className="text-[#38bdf8] text-sm font-semibold">Institution Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>AICTE / UGC / NAAC ID</label>
                      <input value={affiliationId} onChange={(e) => setAffiliationId(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Contact Person Designation</label>
                      <input value={contactDesignation} onChange={(e) => setContactDesignation(e.target.value)}
                        placeholder="e.g. HOD, Dean R&D" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Primary Domains of Expertise</label>
                    <div className="flex flex-wrap gap-2">
                      {DOMAIN_OPTIONS.map((d) => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => toggleDomain(d.value)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition ${domains.includes(d.value)
                            ? 'bg-[#00d2ff]/15 border-[#00d2ff] text-[#00d2ff]'
                            : 'bg-transparent border-[#1e293b] text-[#94a3b8] hover:border-[#00d2ff]/40'
                            }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Institute Website (optional)</label>
                    <input type="url" value={universityWebsite} onChange={(e) => setUniversityWebsite(e.target.value)}
                      placeholder="https://" className={inputClass} />
                  </div>
                </div>
              )}

              {/* INDUSTRY FIELDS */}
              {role === 'industry' && (
                <div className="bg-[#080d1a]/50 border border-[#1e293b] rounded-lg p-4 space-y-4">
                  <h3 className="text-[#38bdf8] text-sm font-semibold">Company Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Industry Sector</label>
                      <select value={sector} onChange={(e) => setSector(e.target.value)} className={inputClass}>
                        <option value="">Select sector</option>
                        {SECTOR_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>GSTIN / Registration Number (optional)</label>
                      <input value={gstin} onChange={(e) => setGstin(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>CSR Focus Area</label>
                      <input value={csrFocus} onChange={(e) => setCsrFocus(e.target.value)}
                        placeholder="e.g. Rural water access" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Contact Person Designation</label>
                      <input value={industryContactDesignation} onChange={(e) => setIndustryContactDesignation(e.target.value)}
                        placeholder="e.g. CSR Head" className={inputClass} />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
                </div>
              </div>

              {error && <p className="text-xs font-medium text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0052cc] to-[#00d2ff] text-white font-bold py-2.5 rounded-lg text-sm transition hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,210,255,0.4)] disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-xs text-[#94a3b8] mt-6">
              Already have an account?{' '}
              <button type="button" onClick={() => navigate('/login')} className="font-semibold text-[#00d2ff] hover:underline">
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}