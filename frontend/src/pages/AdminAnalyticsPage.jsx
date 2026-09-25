import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, GraduationCap, Building2, FolderKanban, IndianRupee, HeartHandshake,
  RefreshCw, AlertTriangle, Info, ShieldAlert, Filter as FilterIcon, X,
  ChevronUp, MapPin, Clock, Flame, Search,
} from 'lucide-react';
import { apiCall } from '../sevices/api';
import ProblemDetailModal from '../components/ProblemDetailModal';

/* ------------------------------------------------------------------ *
 * This page renders GET /api/admin/analytics/impact and nothing else.
 * Every number comes from that response. Metrics YUKTI's current data
 * model cannot back yet (₹ investment, lives impacted, rural/urban
 * split) are rendered as an honest "Not tracked yet" state — never a
 * placeholder number. See yukti-backend/app/api/routes/admin_analytics.py
 * for exactly how each figure is computed.
 * ------------------------------------------------------------------ */

const fmt = (n) => {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString('en-IN');
};

const SEVERITY_STYLES = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  info: 'bg-slate-100 text-slate-600 border-slate-200',
};

function KpiCard({ icon: Icon, label, metric }) {
  const unsupported = metric?.supported === false;
  return (
    <div className="bg-card rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-subText">
        <Icon className="h-4 w-4 text-secondary" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      {unsupported ? (
        <div>
          <div className="text-sm font-semibold text-subText">Not tracked yet</div>
          <div className="text-[11px] text-slate-400 mt-1 leading-snug">{metric.note}</div>
        </div>
      ) : (
        <div className="text-2xl font-extrabold text-primary">{fmt(metric?.value)}</div>
      )}
    </div>
  );
}

function BarList({ rows, valueKey, labelKey, barColor = 'bg-accent', unit = '' }) {
  if (!rows || rows.length === 0) {
    return <div className="text-sm text-subText py-6 text-center">No data for the selected filters.</div>;
  }
  const max = Math.max(...rows.map((r) => r[valueKey]), 1);
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-3 text-xs">
          <div className="w-28 sm:w-36 shrink-0 truncate text-subText" title={r[labelKey]}>{r[labelKey]}</div>
          <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} rounded-full transition-all`}
              style={{ width: `${Math.max(4, (r[valueKey] / max) * 100)}%` }}
            />
          </div>
          <div className="w-12 text-right font-semibold text-mainText">{fmt(r[valueKey])}{unit}</div>
        </div>
      ))}
    </div>
  );
}

function OverviewTrendChart({ series }) {
  if (!series || series.length === 0) {
    return <div className="text-sm text-subText py-6 text-center">No time-series data for the selected filters.</div>;
  }
  const w = 560, h = 200, pad = 28;
  const maxVal = Math.max(1, ...series.flatMap((s) => [s.problems_submitted, s.projects_initiated, s.projects_completed]));
  const stepX = series.length > 1 ? (w - pad * 2) / (series.length - 1) : 0;
  const toPoints = (key) =>
    series
      .map((s, i) => {
        const x = pad + i * stepX;
        const y = h - pad - (s[key] / maxVal) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');

  const lines = [
    { key: 'problems_submitted', color: '#2563EB', label: 'Problems submitted' },
    { key: 'projects_initiated', color: '#0E9686', label: 'Projects initiated' },
    { key: 'projects_completed', color: '#15803D', label: 'Projects completed' },
  ];

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-52">
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#E2E8F0" strokeWidth="1" />
        {lines.map((l) => (
          <polyline key={l.key} points={toPoints(l.key)} fill="none" stroke={l.color} strokeWidth="2.5" />
        ))}
        {series.map((s, i) => (
          <text key={i} x={pad + i * stepX} y={h - 8} fontSize="9" fill="#64748B" textAnchor="middle">
            {s.period.slice(2)}
          </text>
        ))}
      </svg>
      <div className="flex flex-wrap gap-4 mt-2">
        {lines.map((l) => (
          <div key={l.key} className="flex items-center gap-1.5 text-[11px] text-subText">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function UnsupportedMetricCard({ title, metric }) {
  return (
    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-5 flex flex-col justify-center min-h-[120px]">
      <h3 className="text-sm font-bold text-primary mb-1">{title}</h3>
      <p className="text-xs text-subText leading-relaxed">{metric?.note || 'Not tracked yet.'}</p>
    </div>
  );
}

function statusBadge(status) {
  switch ((status || '').toLowerCase()) {
    case 'under review':       return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'university matched': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    case 'in progress':        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'resolved':           return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    default:                   return 'bg-slate-100 text-slate-600 border-slate-300';
  }
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ from: '', to: '', state: '', sector: '', status: '' });

  // Problems feed state
  const [problems, setProblems] = useState([]);
  const [probsLoading, setProbsLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [probSearch, setProbSearch] = useState('');

  const load = useCallback(async (f) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    const result = await apiCall(`/admin/analytics/impact${qs ? `?${qs}` : ''}`);
    if (result) {
      setData(result);
    } else {
      setError('Could not load Impact Analytics from the backend. Nothing is shown in its place — please retry.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(filters); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // Fetch all problems for feed
  useEffect(() => {
    setProbsLoading(true);
    fetch('/api/problems')
      .then(r => r.json())
      .then(d => { setProblems(Array.isArray(d) ? d : []); })
      .catch(() => setProblems([]))
      .finally(() => setProbsLoading(false));
  }, []);

  const applyFilters = (e) => { e.preventDefault(); load(filters); };
  const resetFilters = () => {
    const cleared = { from: '', to: '', state: '', sector: '', status: '' };
    setFilters(cleared);
    load(cleared);
  };

  const sectors = data?.sector_impact?.map((s) => s.sector) || [];

  const filteredProblems = problems.filter(p =>
    !probSearch ||
    (p.title || '').toLowerCase().includes(probSearch.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(probSearch.toLowerCase()) ||
    (p.domain || '').toLowerCase().includes(probSearch.toLowerCase())
  );

  return (
    <>
    <div className="min-h-screen bg-bgSoft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-mainText">Impact Analytics</h1>
            <p className="text-sm text-subText mt-1">
              System-wide view of citizens, partners, projects and outcomes — every figure is computed live from the YUKTI database.
            </p>
          </div>
          {data?.metadata && (
            <div className="text-[11px] text-subText font-medium">
              Last updated {new Date(data.metadata.last_updated).toLocaleString('en-IN')} · methodology {data.metadata.methodology_version}
            </div>
          )}
        </div>

        {/* Filters */}
        <form onSubmit={applyFilters} className="bg-card border border-slate-200 rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-subText mr-2">
            <FilterIcon className="h-3.5 w-3.5" /> Filters
          </div>
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-subText">
            From
            <input type="date" className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-subText">
            To
            <input type="date" className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-subText">
            State / location contains
            <input type="text" placeholder="e.g. Jharkhand" className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-40"
              value={filters.state} onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-subText">
            Sector
            <select className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-40"
              value={filters.sector} onChange={(e) => setFilters((f) => ({ ...f, sector: e.target.value }))}>
              <option value="">All sectors</option>
              {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-subText">
            Project status
            <select className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-32"
              value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <button type="submit" className="bg-secondary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-secondary/90 transition">
            Apply
          </button>
          <button type="button" onClick={resetFilters} className="flex items-center gap-1 text-xs font-bold text-subText px-3 py-2 rounded-lg hover:bg-slate-100 transition">
            <X className="h-3.5 w-3.5" /> Reset
          </button>
          <button type="button" onClick={() => load(filters)} className="ml-auto flex items-center gap-1.5 text-xs font-bold text-secondary px-3 py-2 rounded-lg hover:bg-secondary/10 transition">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </form>

        {loading && (
          <div className="bg-blue-50 text-secondary text-sm font-medium rounded-xl px-4 py-3 mb-6">Loading impact analytics…</div>
        )}
        {error && !loading && (
          <div className="bg-red-50 text-red-700 text-sm font-medium rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}

        {data && (
          <>
            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <KpiCard icon={Users} label="Registered Citizens" metric={data.kpis.total_citizens} />
              <KpiCard icon={GraduationCap} label="Partner Universities" metric={data.kpis.partner_universities} />
              <KpiCard icon={Building2} label="Industry Partners" metric={data.kpis.industry_partners} />
              <KpiCard icon={FolderKanban} label="Total Projects" metric={data.kpis.total_projects} />
              <KpiCard icon={IndianRupee} label="Total Investment" metric={data.kpis.total_investment} />
              <KpiCard icon={HeartHandshake} label="Lives Impacted" metric={data.kpis.lives_impacted} />
            </div>

            {/* Charts grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-card border border-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-bold text-primary mb-1">Impact Overview</h3>
                <p className="text-xs text-subText mb-4">Problems submitted vs projects initiated/completed, month over month.</p>
                <OverviewTrendChart series={data.overview_series} />
              </div>

              <div className="bg-card border border-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-bold text-primary mb-1">Sector-wise Impact</h3>
                <p className="text-xs text-subText mb-4">Real problem-domain taxonomy — where activity is concentrated.</p>
                <BarList rows={data.sector_impact} valueKey="problem_count" labelKey="sector" barColor="bg-accent" />
              </div>

              <div className="bg-card border border-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-bold text-primary mb-1">Project Status</h3>
                <p className="text-xs text-subText mb-4">Actual backend project-status values — no invented stages.</p>
                <BarList rows={data.project_status} valueKey="count" labelKey="status" barColor="bg-secondary" />
              </div>

              <div className="bg-card border border-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-bold text-primary mb-1">Geographical Impact</h3>
                <p className="text-xs text-subText mb-1">{data.geography?.note}</p>
                <p className="text-[11px] text-slate-400 mb-3">
                  {fmt(data.geography?.mapped_points)} problems have verified map coordinates ·{' '}
                  {fmt(data.geography?.unmapped_points)} are missing coordinates.
                </p>
                <BarList rows={data.geography?.by_location} valueKey="problem_count" labelKey="location_text" barColor="bg-primary" />
              </div>
            </div>

            {/* Unsupported metrics — honest empty states, never fabricated */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <UnsupportedMetricCard title="Investment Flow" metric={data.investment_flow} />
              <UnsupportedMetricCard title="Rural vs Urban Impact" metric={data.rural_urban} />
            </div>

            {/* Key outcomes */}
            <div className="bg-card border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">
              <h3 className="text-sm font-bold text-primary mb-1">Key Outcomes</h3>
              <p className="text-xs text-subText mb-4">Measurable results recorded against real projects.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.outcomes.map((o, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="text-xl font-extrabold text-primary">{fmt(o.value)}</div>
                    <div className="text-xs font-semibold text-subText mt-0.5">{o.label}</div>
                    <div className="text-[10px] text-slate-400 mt-2">{o.source}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenges & alerts */}
            <div className="bg-card border border-slate-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-primary">Challenges &amp; Alerts</h3>
              </div>
              <p className="text-xs text-subText mb-4">Every alert is generated from an explicit backend rule — nothing here is invented.</p>
              {data.alerts.length === 0 ? (
                <div className="text-sm text-subText flex items-center gap-2 py-2">
                  <Info className="h-4 w-4" /> No active alerts for the current filters.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {data.alerts.map((a) => (
                    <div key={a.id} className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.info}`}>
                      <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/60 shrink-0">
                        {a.severity}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs font-bold">{a.title}</div>
                        <div className="text-[10px] font-mono opacity-70 mt-0.5">rule: {a.rule}</div>
                      </div>
                      <div className="text-lg font-extrabold shrink-0">{fmt(a.count)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── ALL PROBLEMS FEED ── */}
        <div className="bg-card border border-slate-200 rounded-2xl shadow-sm p-5 mt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-primary">All Problems Feed</h3>
              <p className="text-xs text-subText mt-0.5">Click any problem to view full details</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search title, location, domain..."
                value={probSearch}
                onChange={e => setProbSearch(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {probsLoading ? (
            <div className="text-sm text-subText py-8 text-center">Loading problems…</div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-sm text-subText py-8 text-center">No problems match your search.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProblems.map(prob => (
                <div
                  key={prob.id}
                  onClick={() => setSelectedProblem(prob)}
                  className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all cursor-pointer group"
                >
                  {/* Vote count */}
                  <div className="flex sm:flex-col items-center gap-2 sm:gap-1 min-w-[52px]">
                    <ChevronUp className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition" />
                    <span className="font-extrabold text-slate-800 text-base leading-none">{prob.votes || 0}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">votes</span>
                    {(prob.votes || 0) >= 100 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-orange-500">
                        <Flame className="h-3 w-3" /> Hot
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">{prob.id}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{prob.domain}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusBadge(prob.status)}`}>{prob.status}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-700 transition line-clamp-2">{prob.title}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-cyan-500" />{prob.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{prob.submittedOn || '—'}</span>
                    </div>
                  </div>

                  <div className="self-center text-xs text-blue-600 font-bold whitespace-nowrap group-hover:underline">
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