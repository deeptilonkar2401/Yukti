import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Award, Users, DollarSign, Building, MapPin,
  Calendar, Filter, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2,
  ChevronDown, Download, Layers, Sparkles, PieChart, BarChart2, Globe,
  ChevronUp, Clock, Flame, Search,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import ProblemDetailModal from '../components/ProblemDetailModal';

export default function IndustryAnalyticsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Problems feed state
  const [problems, setProblems] = useState([]);
  const [probsLoading, setProbsLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [probSearch, setProbSearch] = useState('');

  // Filters state
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    district: 'all',
    sector: 'all',
    status: 'all',
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.from_date) queryParams.append('from_date', filters.from_date);
      if (filters.to_date) queryParams.append('to_date', filters.to_date);
      if (filters.district && filters.district !== 'all') queryParams.append('district', filters.district);
      if (filters.sector && filters.sector !== 'all') queryParams.append('sector', filters.sector);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/industry/analytics/impact?${queryParams.toString()}`, { headers });
      
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch industry impact analytics:', err);
      setError('Could not load Industry Impact Analytics data. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters, token]);

  // Fetch problems
  useEffect(() => {
    setProbsLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch('/api/problems', { headers })
      .then(r => r.json())
      .then(d => setProblems(Array.isArray(d) ? d : []))
      .catch(() => setProblems([]))
      .finally(() => setProbsLoading(false));
  }, [token]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      from_date: '',
      to_date: '',
      district: 'all',
      sector: 'all',
      status: 'all',
    });
  };

  function statusBadge(status) {
    switch ((status || '').toLowerCase()) {
      case 'under review':       return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'university matched': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'in progress':        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'resolved':           return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:                   return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  }

  const filteredProblems = problems.filter(p =>
    !probSearch ||
    (p.title || '').toLowerCase().includes(probSearch.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(probSearch.toLowerCase()) ||
    (p.domain || '').toLowerCase().includes(probSearch.toLowerCase())
  );

  return (
    <>
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>YUKTI CSR & Industry Impact Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Industry Impact Analytics
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time measurement of investments, community beneficiaries, district reach & SDGs.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-teal-400" />
            <span>Filters:</span>
          </div>

          {/* District Filter */}
          <select
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="all">All Districts (Jharkhand)</option>
            <option value="Ranchi">Ranchi</option>
            <option value="Dumka">Dumka</option>
            <option value="Palamu">Palamu</option>
            <option value="Khunti">Khunti</option>
            <option value="Jamshedpur">East Singhbhum (Jamshedpur)</option>
          </select>

          {/* Sector Filter */}
          <select
            value={filters.sector}
            onChange={(e) => handleFilterChange('sector', e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="all">All CSR Domains</option>
            <option value="Water Management">Water Management</option>
            <option value="Agriculture & Soil">Agriculture & Soil</option>
            <option value="Sanitation & Waste">Sanitation & Waste</option>
            <option value="Healthcare Infrastructure">Healthcare Infrastructure</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="all">All Project Statuses</option>
            <option value="in_progress">In Development</option>
            <option value="verified">University Matched</option>
            <option value="completed">Field Deployed</option>
          </select>

          {(filters.district !== 'all' || filters.sector !== 'all' || filters.status !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* LOADING & ERROR STATES */}
        {loading && !data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center text-rose-300">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="font-bold">{error}</p>
            <button onClick={fetchAnalytics} className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold">
              Retry Load
            </button>
          </div>
        )}

        {/* ANALYTICS CONTENT */}
        {data && (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between text-indigo-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total CSR Investment</span>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-white">{data.kpis.formatted_investment}</div>
                <div className="text-xs text-indigo-300/80 mt-1">₹14.85 Million allocated across active programs</div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-teal-950/60 border border-teal-500/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between text-teal-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Projects Supported</span>
                  <Building className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-white">{data.kpis.projects_supported} Projects</div>
                <div className="text-xs text-teal-300/80 mt-1">100% verified & matched to university teams</div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-amber-950/60 border border-amber-500/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Lives & Citizens Impacted</span>
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-white">{data.kpis.lives_impacted.toLocaleString()}</div>
                <div className="text-xs text-amber-300/80 mt-1">Verified direct and indirect beneficiaries</div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-emerald-950/60 border border-emerald-500/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Partner Universities</span>
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-white">{data.kpis.partner_universities} Institutions</div>
                <div className="text-xs text-emerald-300/80 mt-1">BIT Mesra, BAU, IIT(ISM) Dhanbad, NIT Jamshedpur</div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-cyan-950/60 border border-cyan-500/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between text-cyan-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Rural Communities Reached</span>
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-white">{data.kpis.rural_communities} Villages</div>
                <div className="text-xs text-cyan-300/80 mt-1">78.5% total impact in rural/tribal blocks</div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-purple-950/60 border border-purple-500/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between text-purple-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">CSR Cost Efficiency</span>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-white">94.2% Direct Impact</div>
                <div className="text-xs text-purple-300/80 mt-1">Minimal overhead via YUKTI digital matching</div>
              </div>
            </div>

            {/* SECTOR ALLOCATION & IMPACT AREAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Investment Breakdown */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  CSR Investment Breakdown by Sector
                </h2>
                <div className="space-y-3">
                  {data.investment_breakdown.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-200">{item.category}</span>
                        <span className="text-slate-400">₹{(item.amount_inr / 100000).toFixed(2)} Lakhs ({item.percentage}%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Areas */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-teal-400" />
                  Beneficiaries & Measured Impact Areas
                </h2>
                <div className="space-y-3">
                  {data.impact_areas.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-100">{item.domain}</div>
                        <div className="text-xs text-slate-400">{item.unit}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-teal-400">{item.beneficiaries_count.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">Beneficiaries</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KEY TANGIBLE OUTCOMES */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Key Tangible Outcomes Delivered
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.key_outcomes.map((out, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase">{out.type}</div>
                    <div className="text-xl font-extrabold text-emerald-400">{out.value}</div>
                    <div className="text-xs text-slate-300">{out.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SOCIAL INDICATORS TABLE */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Social Impact & Baseline Indicators
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[11px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Indicator Name</th>
                      <th className="py-3 px-4">Baseline Value</th>
                      <th className="py-3 px-4">Current Verified Value</th>
                      <th className="py-3 px-4">Net Change</th>
                      <th className="py-3 px-4">Reporting Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.social_indicators.map((ind, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 font-bold text-slate-100">{ind.name}</td>
                        <td className="py-3 px-4 text-slate-400">{ind.baseline}</td>
                        <td className="py-3 px-4 font-bold text-teal-300">{ind.current}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${ind.change_pct < 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-teal-500/15 text-teal-400'}`}>
                            {ind.change_pct > 0 ? `+${ind.change_pct}%` : `${ind.change_pct}%`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{ind.period}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CHALLENGES & ACTION TAKEN */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Field Challenges & Risk Mitigations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.challenges.map((ch, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-100">{ch.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        {ch.severity} Risk
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{ch.description}</p>
                    <div className="pt-2 border-t border-slate-800/80 text-xs text-teal-300">
                      <strong className="text-slate-200">Action Taken: </strong>{ch.action_taken}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 pt-4">
              Data verified against YUKTI Persistent Ledger • Last Updated: {data.last_updated}
            </div>
          </>
        )}

        {/* ── ALL PROBLEMS FEED ── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">All Problems Feed</h2>
              <p className="text-slate-400 text-xs mt-0.5">Click any problem to view full details</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search title, location, domain..."
                value={probSearch}
                onChange={e => setProbSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {probsLoading ? (
            <div className="text-sm text-slate-400 py-8 text-center">Loading problems…</div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-sm text-slate-400 py-8 text-center">No problems match your search.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProblems.map(prob => (
                <div
                  key={prob.id}
                  onClick={() => setSelectedProblem(prob)}
                  className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-950 transition-all cursor-pointer group"
                >
                  {/* Vote count */}
                  <div className="flex sm:flex-col items-center gap-2 sm:gap-1 min-w-[52px]">
                    <ChevronUp className="h-5 w-5 text-slate-500 group-hover:text-teal-400 transition" />
                    <span className="font-extrabold text-white text-base leading-none">{prob.votes || 0}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">votes</span>
                    {(prob.votes || 0) >= 100 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-orange-400">
                        <Flame className="h-3 w-3" /> Hot
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{prob.id}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{prob.domain}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusBadge(prob.status)}`}>{prob.status}</span>
                    </div>
                    <p className="font-bold text-white text-sm leading-snug group-hover:text-teal-300 transition line-clamp-2">{prob.title}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-cyan-400" />{prob.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{prob.submittedOn || '—'}</span>
                    </div>
                  </div>

                  <div className="self-center text-xs text-teal-400 font-bold whitespace-nowrap group-hover:underline">
                    View Details →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Problem Detail Modal */}
    {selectedProblem && (
      <ProblemDetailModal
        prob={selectedProblem}
        onClose={() => setSelectedProblem(null)}
        showViewProjectBtn={true}
      />
    )}
    </>
  );
}
