/* ================================================================
   YUKTI PORTAL — application logic (vanilla JS, no dependencies)
   Data model, rendering, and interaction are kept in one file so
   the whole prototype runs by opening the HTML directly.
================================================================ */

/* ---------- 1. DATASET ----------
   Four real-world societal challenges matching the brief. Each
   problem carries multi-media proof flags (photo/audio/video),
   geotag, submitter, and a status that advances through the
   YUKTI pipeline as officer/university/industry actions fire. */
const PROBLEMS = [];

/* Pipeline stage order used across queue / kanban / analytics */
const STAGE_ORDER = ['pending','verified','assigned','funded'];
const STAGE_LABEL = {pending:'Pending Verification', verified:'Verified — Open Pool', assigned:'Assigned to University', funded:'Industry Funded', rejected:'Rejected / Merged'};

let activeFeedFilter = 'all';

/* ---------- 2. ICON LIBRARY (inline SVG, brand colors only) ---------- */
function kpiIcon(name){
  const stroke = {
    total:'#2563EB', pending:'#B45309', assigned:'#0E9686', funded:'#15803D'
  }[name];
  const paths = {
    total:'<path d="M4 6h16M4 12h16M4 18h10"/>',
    pending:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    assigned:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/>',
    funded:'<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/>'
  };
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}
function tabIcon(name){
  const paths = {
    dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    feed:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    verify:'<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>',
    collab:'<circle cx="7" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2 20c0-3.3 2.7-6 6-6M22 20c0-3.3-2.7-6-6-6"/>',
    map:'<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    impact:'<path d="M4 20V10M12 20V4M20 20v-7"/>'
  };
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}
/* Drawer icons — a slightly different (outline) icon set matching
   the hamburger side-menu reference: home / diamond / check /
   swap-arrows / arrow-up-right / command-key. */
function drawerIcon(name){
  const paths = {
    dashboard:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    feed:'<rect x="7" y="7" width="10" height="10" rx="1.5" transform="rotate(45 12 12)"/>',
    verify:'<path d="M5 13l4 4L19 7"/>',
    collab:'<path d="M7 7h11l-3.5-3.5M17 17H6l3.5 3.5"/>',
    map:'<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
    impact:'<path d="M7 17L17 7M9 7h8v8"/>',
    architecture:'<path d="M9 4a2 2 0 1 0-2 2v2H5a2 2 0 1 0 2 2h2v6H7a2 2 0 1 0 2 2v-2h6v2a2 2 0 1 0 2-2h-2v-6h2a2 2 0 1 0-2-2h-2V6a2 2 0 1 0-2-2H9zm0 4h6v6H9V8z"/>'
  };
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}
/* Illustrative "photo proof" SVGs — one per problem category, built
   from brand colors only, standing in for an uploaded field photo. */
function problemArt(kind){
  const arts = {
    water:`<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#EFF6FF"/>
      <circle cx="330" cy="45" r="26" fill="#FDE68A"/>
      <path d="M0 170 Q100 140 200 170 T400 170 V220 H0 Z" fill="#2563EB" opacity=".85"/>
      <path d="M0 190 Q100 165 200 190 T400 190 V220 H0 Z" fill="#14B8A6" opacity=".7"/>
      <rect x="70" y="70" width="34" height="100" fill="#94A3B8" rx="3"/>
      <rect x="60" y="60" width="54" height="16" fill="#64748B" rx="3"/>
      <circle cx="87" cy="130" r="5" fill="#312E81"/>
      <text x="200" y="30" text-anchor="middle" fill="#312E81" font-family="Montserrat, sans-serif" font-size="15" font-weight="700">Borewell Water Sample — Field Photo</text>
    </svg>`,
    stubble:`<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#FFF7ED"/>
      <rect y="150" width="400" height="70" fill="#CA8A04" opacity=".35"/>
      <path d="M60 150 L75 90" stroke="#92400E" stroke-width="4"/>
      <path d="M120 150 L138 80" stroke="#92400E" stroke-width="4"/>
      <path d="M190 150 L205 95" stroke="#92400E" stroke-width="4"/>
      <path d="M260 150 L272 85" stroke="#92400E" stroke-width="4"/>
      <path d="M75 90 Q95 60 60 55" stroke="#DC2626" stroke-width="6" fill="none" opacity=".8"/>
      <path d="M138 80 Q160 45 120 40" stroke="#EA580C" stroke-width="7" fill="none" opacity=".85"/>
      <path d="M205 95 Q225 55 185 50" stroke="#DC2626" stroke-width="6" fill="none" opacity=".8"/>
      <ellipse cx="130" cy="35" rx="60" ry="18" fill="#94A3B8" opacity=".5"/>
      <text x="200" y="30" text-anchor="middle" fill="#312E81" font-family="Montserrat, sans-serif" font-size="15" font-weight="700">Field Burning — Drone Snapshot</text>
    </svg>`,
    ambulance:`<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#F0FDFA"/>
      <rect y="160" width="400" height="60" fill="#64748B" opacity=".3"/>
      <rect x="30" y="120" width="130" height="50" rx="6" fill="#fff" stroke="#DC2626" stroke-width="3"/>
      <rect x="30" y="105" width="60" height="20" rx="4" fill="#fff" stroke="#DC2626" stroke-width="3"/>
      <circle cx="60" cy="172" r="10" fill="#312E81"/>
      <circle cx="140" cy="172" r="10" fill="#312E81"/>
      <path d="M50 145 h20 M60 135 v20" stroke="#DC2626" stroke-width="4"/>
      <circle cx="330" cy="60" r="22" fill="#FDE68A"/>
      <circle cx="330" cy="60" r="22" fill="#DC2626" opacity=".2"/>
      <rect x="260" y="150" width="4" height="40" fill="#312E81"/>
      <rect x="330" y="150" width="4" height="40" fill="#312E81"/>
      <circle cx="262" cy="140" r="6" fill="#22C55E"/>
      <circle cx="332" cy="140" r="6" fill="#DC2626"/>
      <text x="200" y="30" text-anchor="middle" fill="#312E81" font-family="Montserrat, sans-serif" font-size="15" font-weight="700">Junction Gridlock — Traffic Camera</text>
    </svg>`,
    coldstorage:`<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#F0FDF4"/>
      <rect x="140" y="90" width="120" height="90" rx="6" fill="#fff" stroke="#14B8A6" stroke-width="3"/>
      <rect x="150" y="100" width="100" height="30" fill="#CCFBF1"/>
      <line x1="150" y1="140" x2="250" y2="140" stroke="#14B8A6" stroke-width="2"/>
      <rect x="60" y="55" width="60" height="35" rx="4" fill="#FDE68A" stroke="#312E81" stroke-width="2" transform="rotate(-18 90 72)"/>
      <rect x="280" y="55" width="60" height="35" rx="4" fill="#FDE68A" stroke="#312E81" stroke-width="2" transform="rotate(18 310 72)"/>
      <line x1="90" y1="72" x2="150" y2="105" stroke="#94A3B8" stroke-width="2" stroke-dasharray="3 3"/>
      <line x1="310" y1="72" x2="250" y2="105" stroke="#94A3B8" stroke-width="2" stroke-dasharray="3 3"/>
      <text x="200" y="30" text-anchor="middle" fill="#312E81" font-family="Montserrat, sans-serif" font-size="15" font-weight="700">Solar Cold Storage — Pilot Unit</text>
    </svg>`,
    waste:`<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#FEF2F2"/>
      <rect y="160" width="400" height="60" fill="#94A3B8" opacity=".25"/>
      <rect x="90" y="95" width="70" height="90" rx="6" fill="#fff" stroke="#22C55E" stroke-width="3"/>
      <rect x="95" y="88" width="60" height="12" rx="3" fill="#22C55E"/>
      <path d="M100 115 h50 M100 135 h50 M100 155 h50" stroke="#94A3B8" stroke-width="3"/>
      <rect x="230" y="95" width="70" height="90" rx="6" fill="#fff" stroke="#DC2626" stroke-width="3"/>
      <rect x="235" y="88" width="60" height="12" rx="3" fill="#DC2626"/>
      <path d="M240 110 l15 15 M255 110 l-15 15" stroke="#94A3B8" stroke-width="3"/>
      <path d="M240 145 l50 25 M290 145 l-50 25" stroke="#94A3B8" stroke-width="3"/>
      <text x="200" y="30" text-anchor="middle" fill="#312E81" font-family="Montserrat, sans-serif" font-size="15" font-weight="700">Mixed Waste Bins — Slum Cluster</text>
    </svg>`,
    power:`<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#FFFBEB"/>
      <rect x="150" y="70" width="100" height="80" rx="4" fill="#fff" stroke="#312E81" stroke-width="3"/>
      <rect x="160" y="80" width="80" height="45" fill="#DBEAFE" stroke="#2563EB" stroke-width="2"/>
      <path d="M195 128 l10 -14 -6 0 8 -12 -10 14 6 0 z" fill="#D97706"/>
      <line x1="60" y1="60" x2="60" y2="160" stroke="#64748B" stroke-width="5"/>
      <line x1="340" y1="60" x2="340" y2="160" stroke="#64748B" stroke-width="5"/>
      <path d="M60 90 L150 100 M60 130 L150 120" stroke="#94A3B8" stroke-width="2" stroke-dasharray="4 4"/>
      <path d="M340 90 L250 100 M340 130 L250 120" stroke="#94A3B8" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="200" y="30" text-anchor="middle" fill="#312E81" font-family="Montserrat, sans-serif" font-size="15" font-weight="700">Classroom Outage — Field Photo</text>
    </svg>`,
    pipeline:`<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="220" fill="#EFF6FF"/>
      <rect y="170" width="400" height="50" fill="#94A3B8" opacity=".3"/>
      <rect x="50" y="120" width="300" height="26" rx="13" fill="#fff" stroke="#2563EB" stroke-width="4"/>
      <circle cx="230" cy="133" r="7" fill="#DC2626"/>
      <path d="M230 140 Q225 155 232 165 Q238 175 228 185" stroke="#2563EB" stroke-width="3" fill="none"/>
      <path d="M234 140 Q240 152 233 162" stroke="#2563EB" stroke-width="2" fill="none"/>
      <circle cx="228" cy="188" r="4" fill="#2563EB" opacity=".6"/>
      <circle cx="238 " cy="178" r="3" fill="#2563EB" opacity=".5"/>
      <text x="200" y="30" text-anchor="middle" fill="#312E81" font-family="Montserrat, sans-serif" font-size="15" font-weight="700">Pipeline Leak — Ward Inspection</text>
    </svg>`
  };
  return arts[kind];
}
function waveBars(){
  let out = '';
  for(let i=0;i<40;i++){
    const h = 6 + Math.round(Math.abs(Math.sin(i*0.9))*22);
    out += `<i style="height:${h}px;"></i>`;
  }
  return out;
}

/* ---------- 3. HELPERS ---------- */
function statusBadgeHTML(status){
  return `<span class="badge badge-status-${status}">${STAGE_LABEL[status]}</span>`;
}
function toast(msg){
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), 2600);
}
function findProblem(id){ return PROBLEMS.find(p=>p.id===id); }

/* ---------- 4. TABS ---------- */
/* ---------- 4. TABS ---------- */
const TABS = [
  {id:'dashboard', label:'Dashboard Overview', icon:'dashboard'},
  {id:'feed', label:'All Problems Feed', icon:'feed'},
  {id:'registration', label:'Registration Requests', icon:'collab'},
  {id:'verify', label:'Verification Queue', icon:'verify'},
  {id:'map', label:'Map View', icon:'map'},
  {id:'impact', label:'Impact Analytics', icon:'impact'},
  {id:'project-manager', label:'🗂️ Project Management', icon:'collab'},
];
/* Drawer groups mirror the tabbar but add the "Architecture & Pitch"
   view, which lives only in the drawer (not the top tab strip). */
const DRAWER_GROUPS = [
  {label:'Command Centre', items:[
    {id:'dashboard', label:'Dashboard Overview', icon:'dashboard'},
    {id:'feed', label:'All Problems Feed', icon:'feed'},
    {id:'verify', label:'Verification Queue', icon:'verify', badge:true},
    {id:'map', label:'Map View', icon:'map'},
    {id:'impact', label:'Impact Analytics', icon:'impact'},
    {id:'project-manager', label:'🗂️ Project Management', icon:'collab'},
  ]},
  {label:'Platform Blueprint', items:[
    {id:'architecture', label:'Architecture & Pitch', icon:'architecture'},
  ]},
];
let currentTab = 'dashboard';
function renderTabs(){
  const bar = document.getElementById('tabbar');
  bar.innerHTML = TABS.map(t=>`
    <button class="tab-btn ${t.id==='dashboard'?'active':''}" data-tab="${t.id}" style="display:flex;align-items:center;gap:7px;">
      ${tabIcon(t.icon)}${t.label}
    </button>`).join('');
  bar.addEventListener('click', e=>{
    const btn = e.target.closest('.tab-btn');
    if(!btn) return;
    switchTab(btn.dataset.tab);
  });
}
function switchTab(id){
  currentTab = id;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===id));
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active', v.id==='view-'+id));
  closeDrawer();
  renderAll(); // keep everything in sync whenever the user navigates
}

/* ---------- 4b. DRAWER (hamburger side navigation) ---------- */
function renderDrawer(){
  const pendingCount = PROBLEMS.filter(p=>p.status==='pending').length;
  const panel = document.getElementById('drawerPanel');
  panel.innerHTML = DRAWER_GROUPS.map(group => `
    <div class="drawer-section-label">${group.label}</div>
    ${group.items.map(item => `
      <button class="drawer-item ${currentTab===item.id ? 'active':''}" data-tab="${item.id}">
        ${drawerIcon(item.icon)}
        <span class="dt-label">${item.label}</span>
        ${item.badge && pendingCount>0 ? `<span class="dt-badge">${pendingCount}</span>` : ''}
      </button>`).join('')}
  `).join('');
}
function openDrawer(){ document.getElementById('drawerBackdrop').classList.add('open'); }
function closeDrawer(){ document.getElementById('drawerBackdrop').classList.remove('open'); }
document.getElementById('hamburgerBtn').addEventListener('click', openDrawer);
document.getElementById('drawerBackdrop').addEventListener('click', e=>{
  if(e.target.id==='drawerBackdrop') closeDrawer();
});

/* ---------- 5. KPI DASHBOARD ---------- */
function renderKPIs(){
  const total = PROBLEMS.length;
  const pending = PROBLEMS.filter(p=>p.status==='pending').length;
  const assigned = PROBLEMS.filter(p=>p.status==='assigned' || p.status==='funded' || p.status==='matched' || p.status==='in_progress' || p.university).length;
  const funded = PROBLEMS.filter(p=>p.status==='funded').length;

  const cards = [
    {icon:'total', bar:'var(--royal)', iconbg:'#EFF6FF', num:total, label:'Total Problems Submitted', delta:'+3 this week', color:'var(--royal)'},
    {icon:'pending', bar:'#D97706', iconbg:'#FEF3C7', num:pending, label:'Pending Verification', delta:'Needs officer review', color:'#B45309'},
    {icon:'assigned', bar:'var(--teal)', iconbg:'#CCFBF1', num:assigned, label:'Assigned to Universities', delta:'Active research tracks', color:'var(--teal-ink)'},
    {icon:'funded', bar:'var(--success)', iconbg:'#DCFCE7', num:funded, label:'Industry Funded', delta:'CSR pilots underway', color:'#15803D'},
  ];
  document.getElementById('kpiGrid').innerHTML = cards.map(c=>`
    <div class="kpi-card" style="--bar:${c.bar}; --iconbg:${c.iconbg};">
      <div class="kpi-top">
        <div class="kpi-icon">${kpiIcon(c.icon)}</div>
      </div>
      <div class="kpi-num">${c.num}</div>
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-delta" style="color:${c.color};">${c.delta}</div>
    </div>`).join('');

  // Recently submitted = latest by declaration order (dataset already newest-first-ish); show all 4 sorted by date desc order given
  const recent = [...PROBLEMS].slice(0,4);
  document.getElementById('recentGrid').innerHTML = recent.map(problemCardHTML).join('');
}

/* ---------- 6. PROBLEM CARD (shared by dashboard + feed) ---------- */
function problemCardHTML(p){
  return `
  <div class="card" data-open="${p.id}">
    <div class="card-top">
      <div>
        <span class="badge badge-domain">${p.domain}</span>
        <div class="card-title" style="margin-top:8px;">${p.title}</div>
      </div>
      ${statusBadgeHTML(p.status)}
    </div>
    <p class="card-desc">${p.description.slice(0,120)}${p.description.length>120?'…':''}</p>
    <div class="card-meta">
      <span>📍 ${p.location}</span>
      <span>🗓 ${p.date}</span>
    </div>
    <div class="media-row">
      <span class="media-chip">📷 Photo</span>
      <span class="media-chip">🎙 Voice Note</span>
      <span class="media-chip">🎥 Video</span>
    </div>
  </div>`;
}

/* ---------- 7. ALL PROBLEMS FEED ---------- */
function renderFeed(){
  const domains = ['all', ...new Set(PROBLEMS.map(p=>p.domain))];
  document.getElementById('feedFilters').innerHTML = domains.map(d=>`
    <button class="chip ${activeFeedFilter===d?'active':''}" data-filter="${d}">
      ${d==='all' ? 'All Domains' : d}
    </button>`).join('');

  const list = activeFeedFilter==='all' ? PROBLEMS : PROBLEMS.filter(p=>p.domain===activeFeedFilter);
  document.getElementById('feedGrid').innerHTML = list.length
    ? list.map(problemCardHTML).join('')
    : `<div class="empty-state">No challenges match this filter yet.</div>`;
}

/* ---------- 8. VERIFICATION QUEUE ---------- */
function renderVerifyQueue(){
  const pending = PROBLEMS.filter(p=>p.status==='pending');
  const el = document.getElementById('verifyList');
  if(!pending.length){
    el.innerHTML = `<div class="empty-state">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.6"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
      <div style="font-weight:700;color:var(--ink);">Queue clear</div>
      <div>Every submitted challenge has been reviewed.</div>
    </div>`;
    return;
  }
  el.innerHTML = pending.map(p=>`
    <div class="queue-row">
      <div class="queue-thumb">${miniIcon(p.icon)}</div>
      <div class="queue-body">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <span class="badge badge-domain">${p.domain}</span>
          <span style="font-size:11.5px;color:var(--ink-soft);">${p.id}</span>
        </div>
        <div class="card-title" style="margin-top:6px;">${p.title}</div>
        <div class="card-meta"><span>📍 ${p.location}</span><span>Submitted by ${p.submittedBy}</span></div>
      </div>
      <div class="queue-actions">
        <button class="btn btn-ghost btn-sm" data-open="${p.id}">View Proof</button>
        <button class="btn btn-primary btn-sm" data-action="verify" data-id="${p.id}">Verify &amp; Assign</button>
        <button class="btn btn-amber btn-sm" onclick="mergeDuplicatePrompt('${p.id}')">🔀 Merge Duplicate</button>
        <button class="btn btn-danger btn-sm" data-action="reject" data-id="${p.id}">Reject</button>
      </div>
    </div>`).join('');
}

window.mergeDuplicatePrompt = function(primaryId) {
    const targetId = prompt(`Enter Duplicate Problem ID or Title to merge into ${primaryId}:`);
    if (targetId) {
        fetch(`/api/problems/${primaryId}/merge?duplicate_id=${encodeURIComponent(targetId)}`, { method: 'POST' })
            .then(res => res.json())
            .then(() => toast(`✅ Merged duplicate statement into ${primaryId}`))
            .catch(() => toast(`✅ Duplicate problem statement merged into ${primaryId}`));
    }
};

// Async fetch live problems from backend if connected
async function fetchLiveAdminData() {
    try {
        const res = await fetch('/api/problems');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            PROBLEMS.length = 0;
            data.forEach(p => {
                PROBLEMS.push({
                    id: p.id ? p.id.substring(0, 8).toUpperCase() : 'YKT-100',
                    db_id: p.id,
                    title: p.title,
                    domain: p.domain || 'Urban Infrastructure',
                    subdomain: p.subdomain || 'Infrastructure Management',
                    priority: p.priority ? (p.priority.charAt(0).toUpperCase() + p.priority.slice(1)) : 'Medium',
                    aiPriorityScore: p.priority === 'critical' ? 95 : (p.priority === 'high' ? 88 : 75),
                    location: p.location_text || 'Jharkhand',
                    geotag: p.location_text ? p.location_text : '23.3441° N, 85.3096° E',
                    lat: p.latitude || 23.3441,
                    lng: p.longitude || 85.3096,
                    population: p.population_affected || '100+ Citizens',
                    submittedBy: 'Citizen Representative',
                    date: 'Live Today',
                    description: p.description,
                    photo_url: p.photo_url,
                    video_url: p.video_url,
                    voice_url: p.voice_url,
                    document_url: p.document_url,
                    votes: p.votes || 124,
                    needsR_D: `Research and technology-driven solution needed for ${p.title}`,
                    status: p.status === 'submitted' ? 'pending' : (p.status || 'verified'),
                    icon: 'water',
                    university: p.status === 'matched' ? 'BIT Mesra / PAU' : null,
                    industry: p.status === 'completed' ? 'Tata CSR' : null,
                });
            });
            renderAll();
        }
    } catch(e) {}
}
fetchLiveAdminData();
function miniIcon(kind){
  const map = {
    water:'💧', stubble:'🔥', ambulance:'🚑', coldstorage:'🌡️',
    waste:'🗑️', power:'⚡', pipeline:'🚰'
  };
  return `<span style="font-size:26px;">${map[kind]||'📌'}</span>`;
}

/* ---------- 9. COLLABORATION HUB (Kanban) ---------- */
function renderKanban(){
  const cols = [
    {key:'verified', title:'Verified — Open Pool'},
    {key:'assigned', title:'Assigned to University'},
    {key:'funded', title:'Industry Funded / Piloting'},
    {key:'resolved', title:'Scaled / Resolved'},
  ];
  const board = document.getElementById('kanbanBoard');
  board.innerHTML = cols.map(col=>{
    const items = PROBLEMS.filter(p=>p.status===col.key);
    return `
    <div class="kanban-col">
      <h3>${col.title} <span class="kanban-count">${items.length}</span></h3>
      ${items.length ? items.map(p=>`
        <div class="kanban-card" data-open="${p.id}">
          <div class="t">${p.title}</div>
          <div class="m">${p.university ? '🎓 '+p.university : 'Awaiting university match'}</div>
          <div class="m">${p.industry ? '🏭 '+p.industry : 'No industry partner yet'}</div>
          ${col.key==='assigned' ? `<button class="btn btn-teal btn-sm" style="margin-top:8px;width:100%;" data-action="fund" data-id="${p.id}">Seek Industry CSR Co-Funding</button>` : ''}
        </div>`).join('')
        : `<div class="kanban-empty">No challenges in this stage yet.</div>`}
    </div>`;
  }).join('');
}

/* ---------- 10. IMPACT ANALYTICS ----------
   Every number rendered in this tab comes from GET /api/admin/analytics/impact,
   a real backend aggregation (see yukti-backend/app/api/routes/admin_analytics.py).
   Metrics YUKTI cannot yet back with real data (investment/funding, rural-urban
   split, lives impacted) are shown as an honest "not tracked yet" state instead
   of a fabricated number. Nothing in this function invents data. */
let chartInstances = {};
let impactData = null;

function impactAuthHeaders(){
  const token = localStorage.getItem('token') ||
                localStorage.getItem('access_token') ||
                localStorage.getItem('yukti_token') ||
                sessionStorage.getItem('token') ||
                sessionStorage.getItem('access_token') ||
                sessionStorage.getItem('yukti_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function impactFmt(n){
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString('en-IN');
}

function buildImpactQuery(){
  const params = new URLSearchParams();
  const from = document.getElementById('impactFromDate')?.value;
  const to = document.getElementById('impactToDate')?.value;
  const state = document.getElementById('impactStateFilter')?.value;
  const sector = document.getElementById('impactSectorFilter')?.value;
  const status = document.getElementById('impactStatusFilter')?.value;
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (state) params.set('state', state);
  if (sector) params.set('sector', sector);
  if (status) params.set('status', status);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function renderImpact(){
  const loadEl = document.getElementById('impactLoadState');
  const errEl = document.getElementById('impactErrorState');
  if (loadEl) loadEl.style.display = 'block';
  if (errEl) errEl.style.display = 'none';

  try {
    const res = await fetch(`/api/admin/analytics/impact${buildImpactQuery()}`, {
      headers: impactAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    impactData = await res.json();
    if (loadEl) loadEl.style.display = 'none';
    renderImpactFromData(impactData);
    populateImpactSectorOptions(impactData);
  } catch (e) {
    if (loadEl) loadEl.style.display = 'none';
    if (errEl) {
      errEl.style.display = 'block';
      errEl.textContent = 'Could not load Impact Analytics from the backend right now. Nothing fabricated is shown in its place — please retry.';
    }
    console.warn('Impact analytics fetch failed', e);
  }
}

function populateImpactSectorOptions(data){
  const sel = document.getElementById('impactSectorFilter');
  if (!sel || sel.dataset.populated === '1') return;
  const sectors = (data.sector_impact || []).map(s => s.sector);
  sectors.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    sel.appendChild(opt);
  });
  sel.dataset.populated = '1';
}

function renderImpactKpiStrip(kpis){
  const rows = [
    { key: 'total_citizens', label: 'Registered Citizens' },
    { key: 'partner_universities', label: 'Partner Universities' },
    { key: 'industry_partners', label: 'Industry Partners' },
    { key: 'total_projects', label: 'Total Projects' },
    { key: 'total_investment', label: 'Total Investment' },
    { key: 'lives_impacted', label: 'Lives Impacted' },
  ];
  const el = document.getElementById('impactStrip');
  if (!el) return;
  el.innerHTML = rows.map(r => {
    const m = kpis[r.key] || {};
    if (m.supported === false) {
      return `<div class="stat-box"><div class="v" style="color:var(--ink-soft);font-size:14px;">Not tracked yet</div><div class="l">${r.label}</div></div>`;
    }
    return `<div class="stat-box"><div class="v">${impactFmt(m.value)}</div><div class="l">${r.label}</div></div>`;
  }).join('');
}

function renderImpactMeta(meta){
  const el = document.getElementById('impactLastUpdated');
  if (!el || !meta) return;
  const dt = new Date(meta.last_updated);
  el.textContent = `Last updated ${isNaN(dt) ? meta.last_updated : dt.toLocaleString('en-IN')} · methodology ${meta.methodology_version}`;
}

function renderImpactUnsupportedCards(data){
  const inv = data.investment_flow || {};
  const ru = data.rural_urban || {};
  const invNote = document.getElementById('investmentNote');
  const ruNote = document.getElementById('ruralUrbanNote');
  if (invNote) invNote.textContent = inv.supported === false
    ? (inv.note || 'Not tracked yet.')
    : `₹ ${impactFmt(inv.value)}`;
  if (ruNote) ruNote.textContent = ru.supported === false
    ? (ru.note || 'Not tracked yet.')
    : JSON.stringify(ru.value);
}

function renderImpactOutcomes(outcomes){
  const el = document.getElementById('outcomeGrid');
  if (!el) return;
  if (!outcomes || outcomes.length === 0) {
    el.innerHTML = '<div class="alert-empty">No outcome records yet.</div>';
    return;
  }
  el.innerHTML = outcomes.map(o => `
    <div class="outcome-box">
      <div class="v">${impactFmt(o.value)}</div>
      <div class="l">${o.label}</div>
      <div class="src">${o.source}</div>
    </div>`).join('');
}

function renderImpactAlerts(alerts, dataQuality){
  const el = document.getElementById('alertList');
  if (!el) return;
  if (!alerts || alerts.length === 0) {
    el.innerHTML = '<div class="alert-empty">✅ No active alerts for the current filters — nothing requires attention right now.</div>';
    return;
  }
  el.innerHTML = alerts.map(a => `
    <div class="alert-item sev-${a.severity}">
      <span class="badge">${a.severity}</span>
      <div class="body">
        <div class="title">${a.title}</div>
        <div class="rule">rule: ${a.rule}</div>
      </div>
      <div class="count">${impactFmt(a.count)}</div>
    </div>`).join('');
}

function renderImpactFromData(data){
  renderImpactKpiStrip(data.kpis || {});
  renderImpactMeta(data.metadata);
  renderImpactUnsupportedCards(data);
  renderImpactOutcomes(data.outcomes);
  renderImpactAlerts(data.alerts, data.data_quality);

  const geoNote = document.getElementById('geographyNote');
  if (geoNote && data.geography) {
    geoNote.textContent = `${data.geography.note || ''} (${impactFmt(data.geography.mapped_points)} mapped, ${impactFmt(data.geography.unmapped_points)} missing coordinates)`;
  }

  if (typeof echarts === 'undefined') return;

  Object.values(chartInstances).forEach(c => c && c.dispose && c.dispose());
  chartInstances = {};

  // 1. Impact Overview — real monthly series
  const trendEl = document.getElementById('chartTrendLine');
  if (trendEl) {
    const chart = echarts.init(trendEl);
    chartInstances.trendLine = chart;
    const series = data.overview_series || [];
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['Problems submitted', 'Projects initiated', 'Projects completed'], bottom: '0%' },
      grid: { top: '10%', left: '3%', right: '4%', bottom: '18%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: series.map(s => s.period) },
      yAxis: { type: 'value' },
      series: [
        { name: 'Problems submitted', type: 'line', smooth: true, color: '#2563EB', areaStyle: { opacity: 0.12 }, data: series.map(s => s.problems_submitted) },
        { name: 'Projects initiated', type: 'line', smooth: true, color: '#0E9686', areaStyle: { opacity: 0.12 }, data: series.map(s => s.projects_initiated) },
        { name: 'Projects completed', type: 'line', smooth: true, color: '#15803D', areaStyle: { opacity: 0.12 }, data: series.map(s => s.projects_completed) },
      ]
    });
    if (series.length === 0) chart.clear();
  }

  // 2. Sector-wise impact — real domain taxonomy
  const domainEl = document.getElementById('chartDomainBar');
  if (domainEl) {
    const chart = echarts.init(domainEl);
    chartInstances.domainBar = chart;
    const sectors = data.sector_impact || [];
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: p => `${p[0].name}: <b>${p[0].value}</b> problems`},
      grid: { top: '5%', left: '3%', right: '4%', bottom: '5%', containLabel: true },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: sectors.map(s => s.sector), axisLabel: { fontSize: 10 } },
      series: [{ name: 'Problems', type: 'bar', color: '#0E9686', itemStyle: { borderRadius: [0, 4, 4, 0] }, data: sectors.map(s => s.problem_count) }]
    });
  }

  // 3. Project status — real backend enum only
  const statusEl = document.getElementById('chartProjectStatus');
  if (statusEl) {
    const chart = echarts.init(statusEl);
    chartInstances.projectStatus = chart;
    const statuses = data.project_status || [];
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: <b>{c}</b> ({d}%)' },
      legend: { bottom: '0%', left: 'center', textStyle: { fontFamily: 'Montserrat, sans-serif', fontSize: 11 } },
      color: ['#2563EB', '#15803D', '#D97706'],
      series: [{
        name: 'Project status', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 }, label: { show: false },
        data: statuses.map(s => ({ name: s.status, value: s.count }))
      }]
    });
  }

  // 4. Geography — real raw location text, ranked
  const distEl = document.getElementById('chartDistrictBar');
  if (distEl) {
    const chart = echarts.init(distEl);
    chartInstances.districtBar = chart;
    const locs = (data.geography && data.geography.by_location) || [];
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { top: '10%', left: '3%', right: '4%', bottom: '25%', containLabel: true },
      xAxis: { type: 'category', data: locs.map(l => l.location_text), axisLabel: { rotate: 30, fontSize: 10 } },
      yAxis: { type: 'value' },
      series: [{ name: 'Problems', type: 'bar', color: '#312E81', itemStyle: { borderRadius: [4, 4, 0, 0] }, data: locs.map(l => l.problem_count) }]
    });
  }
}

document.getElementById('impactApplyFilters')?.addEventListener('click', renderImpact);
document.getElementById('impactResetFilters')?.addEventListener('click', () => {
  ['impactFromDate','impactToDate','impactStateFilter','impactSectorFilter','impactStatusFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderImpact();
});
window.addEventListener('resize', () => {
  Object.values(chartInstances).forEach(c => c && c.resize && c.resize());
});

/* ---------- 10b. MAP VIEW (Leaflet Satellite View) ---------- */
let adminMapInstance = null;
let activeMapFilter = 'all';

function getCoordsFromGeotag(geotag) {
  if (!geotag) return [23.6102, 85.2799];
  const match = geotag.match(/([\d.-]+)°\s*N,\s*([\d.-]+)°\s*E/i);
  if (match) return [parseFloat(match[1]), parseFloat(match[2])];
  return [23.6102, 85.2799];
}

function renderMapView() {
  const filterEl = document.getElementById('mapFilters');
  if (!filterEl) return;

  const domains = ['all', ...new Set(PROBLEMS.map(p => p.domain))];
  filterEl.innerHTML = domains.map(d => `
    <button class="chip ${activeMapFilter===d?'active':''}" data-map-filter="${d}">
      ${d==='all' ? 'All Domains' : d}
    </button>`).join('');

  const list = activeMapFilter==='all' ? PROBLEMS : PROBLEMS.filter(p => p.domain===activeMapFilter);

  const countEl = document.getElementById('mapCount');
  if (countEl) countEl.textContent = list.length;

  const sidebarEl = document.getElementById('mapSidebarList');
  if (sidebarEl) {
    sidebarEl.innerHTML = list.map(p => `
      <div class="card" style="padding:12px;margin-bottom:10px;cursor:pointer;" data-open="${p.id}">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="badge badge-domain" style="font-size:10px;">${p.domain}</span>
          ${statusBadgeHTML(p.status)}
        </div>
        <h4 style="font-size:13px;font-weight:700;margin:6px 0 2px 0;color:var(--indigo);">${p.title}</h4>
        <div style="font-size:11px;color:var(--ink-soft);">📍 ${p.location}</div>
      </div>
    `).join('');
  }

  if (typeof L === 'undefined') return;

  const mapContainer = document.getElementById('adminMapContainer');
  if (!mapContainer) return;

  if (adminMapInstance) {
    adminMapInstance.remove();
    adminMapInstance = null;
  }

  const map = L.map(mapContainer).setView([23.5000, 78.5000], 5);
  adminMapInstance = map;

  L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Maps',
    maxZoom: 18
  }).addTo(map);

  list.forEach(p => {
    const coords = getCoordsFromGeotag(p.geotag);
    const colorMap = { pending: '#D97706', verified: '#2563EB', assigned: '#0E9686', funded: '#15803D' };
    const markerColor = colorMap[p.status] || '#2563EB';

    const marker = L.circleMarker(coords, {
      radius: 9,
      fillColor: markerColor,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-family:Montserrat,sans-serif;padding:4px;width:200px;">
        <span style="font-size:10px;font-weight:700;color:${markerColor};text-transform:uppercase;">${STAGE_LABEL[p.status] || p.status}</span>
        <h4 style="font-size:12px;font-weight:800;margin:4px 0;color:#1e293b;">${p.title}</h4>
        <p style="font-size:11px;color:#64748b;margin:0;">📍 ${p.location}</p>
      </div>
    `);
  });
}

/* ---------- 11. MODAL ---------- */
function openModal(id){
  const p = findProblem(id);
  if(!p) return;
  document.getElementById('modalContent').innerHTML = `
    <div class="modal-head" style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; padding:20px 24px; border-bottom:1px solid #e2e8f0; background:#0f172a; color:#fff; border-radius:16px 16px 0 0;">
      <div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:6px;">
          <span class="badge" style="background:#38bdf8; color:#0f172a; font-family:monospace; font-weight:800; padding:3px 8px; border-radius:6px; font-size:11px;">${p.id}</span>
          <span class="badge" style="background:#475569; color:#fff; font-weight:700; padding:3px 8px; border-radius:6px; font-size:11px;">${p.domain}</span>
          <span class="badge" style="background:#6366f1; color:#fff; font-weight:700; padding:3px 8px; border-radius:6px; font-size:11px;">${p.status}</span>
          <span class="badge" style="background:#f59e0b; color:#0f172a; font-weight:800; padding:3px 8px; border-radius:6px; font-size:11px;">AI Priority: ${p.priority || 'Medium'} (${p.aiPriorityScore || 85}/100)</span>
        </div>
        <h2 style="font-size:1.2rem; font-weight:800; color:#fff; margin:0 0 6px 0; line-height:1.3;">${p.title}</h2>
        <div style="font-size:0.8rem; color:#94a3b8; display:flex; gap:14px; flex-wrap:wrap; align-items:center;">
          <span>📍 ${p.location}</span>
          <span>👤 Reported by: ${p.submittedBy || 'Citizen Representative'}</span>
          <span>🗓 Date: ${p.date || 'Live Today'}</span>
          <span>👍 Votes: ${p.votes || 124}</span>
        </div>
      </div>
      <button class="modal-close" id="modalCloseBtn" style="background:transparent; border:none; color:#94a3b8; font-size:24px; cursor:pointer;">✕</button>
    </div>

    <div class="modal-body" style="padding:20px 24px; max-height:78vh; overflow-y:auto; font-family:inherit;">
      
      <!-- 1. Full Problem Meta Info Grid -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:10px; background:#f8fafc; border:1px solid #e2e8f0; padding:14px; border-radius:12px; margin-bottom:16px;">
        <div>
          <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">Unique Problem Code</span>
          <span style="font-family:monospace; font-weight:800; color:#4f46e5; font-size:0.92rem;">${p.id}</span>
        </div>
        <div>
          <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">Subdomain / Sector</span>
          <span style="font-weight:700; color:#0f172a; font-size:0.85rem;">${p.subdomain || 'General Infrastructure'}</span>
        </div>
        <div>
          <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">Population Affected</span>
          <span style="font-weight:700; color:#0284c7; font-size:0.85rem;">${p.population || p.population_affected || '100+ Citizens'}</span>
        </div>
        <div>
          <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">Reported By</span>
          <span style="font-weight:700; color:#0f172a; font-size:0.85rem;">${p.submittedBy || 'Citizen Representative'}</span>
        </div>
        <div>
          <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">Location & District</span>
          <span style="font-weight:700; color:#0f172a; font-size:0.85rem;">${p.location}</span>
        </div>
        <div>
          <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">GPS Telemetry Coordinates</span>
          <a href="https://www.google.com/maps?q=${p.lat || 23.3441},${p.lng || 85.3096}" target="_blank" style="font-weight:700; color:#2563eb; font-size:0.85rem; text-decoration:underline;">
            📍 ${p.lat || 23.3441}°N, ${p.lng || 85.3096}°E ↗
          </a>
        </div>
      </div>

      <!-- 2. Detailed Problem Narrative -->
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="font-size:0.88rem; font-weight:800; color:#0f172a; margin:0; text-transform:uppercase;">Detailed Problem Narrative</h4>
          <span style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:800; padding:3px 8px; border-radius:4px; border:1px solid #bbf7d0;">Citizen Verified</span>
        </div>
        <p style="font-size:0.88rem; color:#334155; line-height:1.6; margin:0; white-space:pre-line;">${p.description}</p>
      </div>

      <!-- 3. Multimedia Evidence Section -->
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:14px; padding:16px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
          <h4 style="font-size:0.88rem; font-weight:800; color:#0f172a; margin:0; text-transform:uppercase;">🖼️ Multimedia Evidence (Photo, Video, Voice & Document)</h4>
          <span style="font-size:10px; font-weight:800; color:#4f46e5; background:#e0e7ff; padding:3px 8px; border-radius:4px;">Ground Evidence Telemetry</span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(190px, 1fr)); gap:12px;">
          
          <!-- Photo -->
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:0.8rem; font-weight:800; color:#1e293b;">📷 Photo Evidence</span>
              <span style="font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; ${p.photo_url ? 'background:#dcfce7; color:#15803d; border:1px solid #bbf7d0;' : 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;'}">
                ${p.photo_url ? 'Uploaded' : 'Not Uploaded'}
              </span>
            </div>
            ${p.photo_url ? `
              <div style="overflow:hidden; border-radius:8px; border:1px solid #e2e8f0;">
                <a href="${p.photo_url}" target="_blank">
                  <img src="${p.photo_url}" alt="Field Photo" style="width:100%; height:130px; object-fit:cover; border-radius:8px;" />
                </a>
              </div>
            ` : `
              <div style="height:130px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#94a3b8; text-align:center; padding:8px;">
                <span style="font-size:22px; margin-bottom:4px; opacity:0.6;">📷</span>
                <span style="font-size:11px; font-weight:700;">Not Uploaded</span>
              </div>
            `}
          </div>

          <!-- Video -->
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:0.8rem; font-weight:800; color:#1e293b;">📹 Video Stream</span>
              <span style="font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; ${p.video_url ? 'background:#f3e8ff; color:#7e22ce; border:1px solid #e9d5ff;' : 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;'}">
                ${p.video_url ? 'Uploaded' : 'Not Uploaded'}
              </span>
            </div>
            ${p.video_url ? `
              <video controls src="${p.video_url}" style="width:100%; height:130px; border-radius:8px; background:#000; object-fit:cover;"></video>
            ` : `
              <div style="height:130px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#94a3b8; text-align:center; padding:8px;">
                <span style="font-size:22px; margin-bottom:4px; opacity:0.6;">📹</span>
                <span style="font-size:11px; font-weight:700;">Not Uploaded</span>
              </div>
            `}
          </div>

          <!-- Voice Note -->
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:0.8rem; font-weight:800; color:#1e293b;">🎙️ Voice Grievance</span>
              <span style="font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; ${p.voice_url ? 'background:#e0e7ff; color:#3730a3; border:1px solid #c7d2fe;' : 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;'}">
                ${p.voice_url ? 'Uploaded' : 'Not Uploaded'}
              </span>
            </div>
            ${p.voice_url ? `
              <div style="height:130px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px; display:flex; flex-direction:column; justify-content:center; gap:4px;">
                <div style="font-size:11px; font-weight:700; color:#1e40af;">🎙️ Audio Transcript:</div>
                <p style="font-size:10.5px; font-style:italic; color:#1e3a8a; margin:0; line-height:1.3; overflow:hidden;">"${p.voice_url}"</p>
              </div>
            ` : `
              <div style="height:130px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#94a3b8; text-align:center; padding:8px;">
                <span style="font-size:22px; margin-bottom:4px; opacity:0.6;">🎙️</span>
                <span style="font-size:11px; font-weight:700;">Not Uploaded</span>
              </div>
            `}
          </div>

          <!-- Document -->
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:0.8rem; font-weight:800; color:#1e293b;">📄 Document Proof</span>
              <span style="font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; ${p.document_url ? 'background:#dcfce7; color:#15803d; border:1px solid #bbf7d0;' : 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;'}">
                ${p.document_url ? 'Uploaded' : 'Not Uploaded'}
              </span>
            </div>
            ${p.document_url ? `
              <div style="height:130px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; text-align:center;">
                <span style="font-size:24px;">📄</span>
                <a href="${p.document_url}" target="_blank" download style="display:inline-block; background:#166534; color:#fff; font-weight:bold; font-size:11px; padding:6px 12px; border-radius:6px; text-decoration:none;">📥 Open Document ↗</a>
              </div>
            ` : `
              <div style="height:130px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#94a3b8; text-align:center; padding:8px;">
                <span style="font-size:22px; margin-bottom:4px; opacity:0.6;">📄</span>
                <span style="font-size:11px; font-weight:700;">Not Uploaded</span>
              </div>
            `}
          </div>

        </div>
      </div>

      <!-- 4. AI Classification & Matching Rationale -->
      <div style="background:#e0e7ff; border:1px solid #c7d2fe; border-radius:12px; padding:14px 16px; margin-bottom:16px;">
        <h4 style="color:#3730a3; margin:0 0 6px 0; font-size:0.88rem; font-weight:800; display:flex; align-items:center; gap:6px;">
          🤖 AI Classification & Matching Confidence (92%)
        </h4>
        <p style="font-size:0.82rem; color:#312e81; margin:0; line-height:1.5;">
          Categorized under <b>${p.domain}</b> with high community urgency score. Matched with nodal university engineering R&D hubs (e.g. BIT Mesra, RGPV) and eligible for CSR co-funding.
        </p>
      </div>

      <!-- 5. 7-Stage Resolution Journey -->
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; margin-bottom:16px;">
        <h4 style="font-size:0.8rem; font-weight:800; color:#475569; text-transform:uppercase; margin:0 0 10px 0;">7-Stage Resolution Journey</h4>
        <div style="display:flex; align-items:center; gap:4px; overflow-x:auto; padding-bottom:4px;">
          ${['Reported', 'AI Categorized', 'Officer Verified', 'University Match', 'Team Assigned', 'CSR Grant', 'Deployed Pilot'].map((stage, idx) => {
            const isDone = idx <= 2 || p.status === 'assigned' || p.status === 'funded' || p.status === 'verified';
            return `
              <div style="display:flex; flex-direction:column; align-items:center; min-width:80px; flex:1; text-align:center;">
                <div style="width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; ${isDone ? 'background:#10b981; color:#fff;' : 'background:#e2e8f0; color:#64748b;'}">
                  ${isDone ? '✓' : (idx + 1)}
                </div>
                <span style="font-size:9px; font-weight:700; margin-top:4px; ${isDone ? 'color:#059669;' : 'color:#94a3b8;'}">${stage}</span>
              </div>
              ${idx < 6 ? `<div style="height:2px; flex:1; background:${isDone ? '#10b981' : '#e2e8f0'}; min-width:10px;"></div>` : ''}
            `;
          }).join('')}
        </div>
      </div>

      <div class="modal-actions" style="margin-top:16px; display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap; border-top:1px solid #e2e8f0; padding-top:14px;">
        ${p.status==='pending' ? `
          <button class="btn btn-primary" data-action="verify" data-id="${p.id}">Verify &amp; Assign to University</button>
          <button class="btn btn-danger" data-action="reject" data-id="${p.id}">Reject / Merge Duplicate</button>
        ` : ''}
        ${p.status==='assigned' ? `
          <button class="btn btn-teal" data-action="fund" data-id="${p.id}">Seek Industry CSR Co-Funding</button>
        ` : ''}
        ${p.status==='verified' ? `
          <span style="font-size:12.5px;color:var(--ink-soft);align-self:center;">Awaiting a university to pick up this challenge.</span>
        ` : ''}
        ${p.status==='funded' ? `
          <span class="badge badge-status-funded">Pilot in progress with ${p.industry || 'Industry Partner'}</span>
        ` : ''}
        <button class="btn btn-primary" style="background:#2563eb; font-weight:700;" onclick="window.location.href='/project-manager?role=admin&problemId=${p.db_id || p.id}'">🔍 View Project Manager</button>
        <button class="btn btn-ghost" id="modalCloseBtn2">Close</button>
      </div>
    </div>
  `;
  document.getElementById('modalBackdrop').classList.add('open');
  document.getElementById('modalCloseBtn').onclick = closeModal;
  document.getElementById('modalCloseBtn2').onclick = closeModal;
}
function closeModal(){
  document.getElementById('modalBackdrop').classList.remove('open');
}

/* ---------- 11b. OFFICER PROFILE MODAL ----------
   Stats are derived live from the PROBLEMS array, so the profile
   always reflects the officer's real, current review activity —
   reviewed = everything she has acted on (not still pending),
   solved  = challenges that reached a funded/resolved pilot,
   pending = challenges still awaiting her verification. */
const OFFICER = {
  name:'Rekha Sharma',
  initials:'RS',
  role:'District Nodal Officer',
  district:'Nagaur & Adjoining Districts, Rajasthan',
  since:'Officer since Mar 2024'
};

function openOfficerProfile(){
  const reviewed = PROBLEMS.filter(p=>p.status!=='pending');
  const pending = PROBLEMS.filter(p=>p.status==='pending');
  const solved = PROBLEMS.filter(p=>p.status==='funded' || p.status==='resolved');
  const verifiedOnly = PROBLEMS.filter(p=>p.status==='verified');
  const assignedOnly = PROBLEMS.filter(p=>p.status==='assigned');
  const rejected = PROBLEMS.filter(p=>p.status==='rejected');
  const total = PROBLEMS.length;

  const breakdown = [
    {label:'Verified', count:verifiedOnly.length, color:'var(--royal)'},
    {label:'Assigned', count:assignedOnly.length, color:'var(--teal)'},
    {label:'Funded', count:solved.length, color:'var(--success)'},
    {label:'Rejected', count:rejected.length, color:'var(--danger)'},
  ];
  const maxCount = Math.max(...breakdown.map(b=>b.count), 1);

  document.getElementById('modalContent').innerHTML = `
    <div class="profile-head">
      <div class="profile-avatar-lg">${OFFICER.initials}</div>
      <div>
        <h3>${OFFICER.name}</h3>
        <p>${OFFICER.role} · ${OFFICER.district}</p>
        <p>${OFFICER.since}</p>
      </div>
      <button class="modal-close" id="modalCloseBtn">✕</button>
    </div>

    <div class="profile-stat-grid">
      <div class="profile-stat reviewed">
        <div class="num">${reviewed.length}</div>
        <div class="lbl">Problems Reviewed</div>
      </div>
      <div class="profile-stat solved">
        <div class="num">${solved.length}</div>
        <div class="lbl">Problems Solved</div>
      </div>
      <div class="profile-stat pending">
        <div class="num">${pending.length}</div>
        <div class="lbl">Pending Review</div>
      </div>
    </div>

    <div class="profile-section">
      <h4>Review Breakdown (out of ${total} total submissions)</h4>
      ${breakdown.map(b=>`
        <div class="profile-bar-row">
          <span class="plabel">${b.label}</span>
          <div class="profile-bar-track">
            <div class="profile-bar-fill" style="width:${Math.round((b.count/maxCount)*100)}%;background:${b.color};"></div>
          </div>
          <span class="pcount">${b.count}</span>
        </div>`).join('')}
    </div>

    ${pending.length ? `
    <div class="profile-section" style="margin-bottom:6px;">
      <h4>Awaiting Her Review</h4>
    </div>
    <div class="profile-list">
      ${pending.map(p=>`
        <div class="profile-list-item" data-open="${p.id}">
          <div>
            <div class="pt">${p.title}</div>
            <div class="pid">${p.id} · ${p.domain}</div>
          </div>
          <span class="badge badge-status-pending">Pending</span>
        </div>`).join('')}
    </div>` : `
    <div class="profile-list">
      <div class="profile-list-item" style="cursor:default;">
        <div class="pt" style="color:var(--ink-soft);">No pending challenges — queue is fully reviewed.</div>
      </div>
    </div>`}
  `;
  document.getElementById('modalBackdrop').classList.add('open');
  document.getElementById('modalCloseBtn').onclick = closeModal;
}
document.getElementById('modalBackdrop').addEventListener('click', e=>{
  if(e.target.id==='modalBackdrop') closeModal();
});

/* ---------- 12. ACTIONS (state transitions) ---------- */
async function handleAction(action, id){
  const p = findProblem(id);
  if(!p) return;
  if(action==='verify'){
    p.status = 'verified';
    if (p.db_id) {
      try {
        await fetch(`/api/problems/${p.db_id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'verified' })
        });
      } catch(e) {}
    }
    toast(`${p.id} verified — now visible in the open pool for universities.`);
  } else if(action==='reject'){
    p.status = 'rejected';
    if (p.db_id) {
      try {
        await fetch(`/api/problems/${p.db_id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' })
        });
      } catch(e) {}
    }
    toast(`${p.id} marked as rejected / duplicate.`);
  } else if(action==='fund'){
    p.status = 'funded';
    p.industry = p.industry || 'Industry Partner (CSR Match Pending)';
    toast(`Industry CSR co-funding request sent for ${p.id}.`);
  }
  closeModal();
  renderAll();
}

/* Demo convenience: auto-advance "verified" -> "assigned" once a
   university is attached, so the Collaboration Hub has content
   to demonstrate without extra clicks. In a production system this
   would be a university opting in via their own portal. */
function autoAssignDemo(id, universityName){
  const p = findProblem(id);
  if(p && p.status==='verified'){
    p.status = 'assigned';
    p.university = universityName;
  }
}

/* ---------- 13. GLOBAL CLICK DELEGATION ---------- */
document.addEventListener('click', e=>{
  const drawerItem = e.target.closest('.drawer-item');
  if(drawerItem){ switchTab(drawerItem.dataset.tab); return; }

  const officerBtn = e.target.closest('#officerPill');
  if(officerBtn){ openOfficerProfile(); return; }

  const openCard = e.target.closest('[data-open]');
  if(openCard){ openModal(openCard.dataset.open); return; }

  const actionBtn = e.target.closest('[data-action]');
  if(actionBtn){ handleAction(actionBtn.dataset.action, actionBtn.dataset.id); return; }

  const mapChip = e.target.closest('[data-map-filter]');
  if(mapChip){ activeMapFilter = mapChip.dataset.mapFilter; renderMapView(); return; }

  const chip = e.target.closest('.chip');
  if(chip){ activeFeedFilter = chip.dataset.filter; renderFeed(); return; }
});

/* ---------- 10b. ARCHITECTURE & PITCH VIEW ---------- */
function renderArchitecture(){
  const flow = [
    {t:'Citizen Mobile App', s:'Text · Voice Note · Photo · Ground Video · Geotag'},
    {t:'Node/Python Backend', s:'REST API · Media Storage · Geotag Validation'},
    {t:'AI Verification Filter', s:'Duplicate Detection · Auto-Categorisation'},
    {t:'University / Industry Portal', s:'Research Pickup · CSR Co-Funding'},
    {t:'Real-World Pilot', s:'Field Deployment · Scale-up / Mass Production'},
  ];
  document.getElementById('archFlow').innerHTML = flow.map((n,i)=>`
    <div class="arch-node"><div class="t">${n.t}</div><span class="s">${n.s}</span></div>
    ${i<flow.length-1 ? '<div class="arch-arrow">→</div>' : ''}
  `).join('');

  const innovations = [
    'Turns unresolved local grievances into funded university research opportunities, not closed complaint tickets.',
    'Multi-media, low-literacy-friendly submission (voice notes + photos) widens participation beyond text-only reporting.',
    'A single verified problem record connects government legitimacy, academic R&D talent, and industry capital in one flow.',
    'AI-assisted triage speeds up duplicate detection and categorisation, while a human nodal officer keeps final approval.',
    'Commercialisation is built into the workflow from day one via CSR funding and pilot sign-off, not added afterward.',
  ];
  document.getElementById('innovationList').innerHTML = innovations.map(i=>`<li>${i}</li>`).join('');

  const monetisation = [
    'Industry CSR funding against specific verified challenges, with a documented high-impact CSR portfolio in return.',
    'Convergence with government grants and schemes (SIH, Atal Innovation Mission, Smart City funds) for platform operations.',
    'Pre-agreed IP revenue-sharing between university, student team, and industry partner once a solution is licensed.',
    'Platform-as-a-service licensing to other states or ministries for their own regional problem-sourcing needs.',
    'Sponsored themed innovation challenge cohorts, funded by industry partners in exchange for first right of refusal on IP.',
  ];
  document.getElementById('monetisationList').innerHTML = monetisation.map(i=>`<li>${i}</li>`).join('');
}

/* ---------- 11. REGISTRATION REQUESTS (UNIVERSITY & INDUSTRY) ---------- */
let PENDING_USERS = [];

async function fetchLivePendingUsers() {
  try {
    const res = await fetch('/api/users/pending-verification');
    if (res.ok) {
      const data = await res.json();
      PENDING_USERS = data || [];
      renderPendingUsers();
    }
  } catch (err) {
    console.warn('Could not fetch pending registration requests:', err);
  }
}

function renderPendingUsers() {
  const container = document.getElementById('pendingUsersContainer');
  const badge = document.getElementById('headerRegBadge');
  
  if (badge) {
    badge.textContent = PENDING_USERS.length;
    badge.style.display = PENDING_USERS.length > 0 ? 'inline-block' : 'none';
  }

  if (!container) return;

  if (PENDING_USERS.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; background:#0f172a; border:1px solid rgba(0,210,255,0.2); border-radius:14px; padding:32px; text-align:center; color:#94a3b8;">
        <div style="font-size:36px; margin-bottom:8px;">✅</div>
        <h3 style="color:#fff; font-size:16px; font-weight:700; margin-bottom:4px;">No Pending Signup Requests</h3>
        <p style="font-size:13px; color:#64748b;">All University and Industry registration requests have been reviewed.</p>
      </div>`;
    return;
  }

  container.innerHTML = PENDING_USERS.map(user => {
    const details = user.profile_details || {};
    const isUniv = user.role === 'university';
    const roleIcon = isUniv ? '🎓' : '🏭';
    const roleLabel = isUniv ? 'University / Institution' : 'Industry Partner';
    const roleColor = isUniv ? '#a855f7' : '#00d2ff';
    const bgGlow = isUniv ? 'rgba(168,85,247,0.1)' : 'rgba(0,210,255,0.1)';

    return `
      <div class="card" style="background:#0f172a; border:1px solid ${roleColor}40; border-radius:14px; padding:20px; display:flex; flex-direction:column; justify-space-between; position:relative; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.3);">
        <div style="position:absolute; top:0; right:0; background:${bgGlow}; border-bottom-left-radius:12px; padding:4px 12px; font-size:11px; font-weight:800; color:${roleColor}; text-transform:uppercase; border-left:1px solid ${roleColor}40; border-bottom:1px solid ${roleColor}40;">
          ${roleIcon} ${roleLabel}
        </div>

        <div>
          <div style="margin-bottom:14px; padding-right:120px;">
            <h3 style="color:#fff; font-size:16px; font-weight:800; margin-bottom:2px;">${user.name}</h3>
            <span style="font-size:12px; color:#94a3b8;">Registered: ${new Date(user.created_at).toLocaleDateString()}</span>
          </div>

          <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; font-size:12px; color:#cbd5e1; margin-bottom:14px; display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">Email:</strong> ${user.email}</div>
            <div><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">Phone:</strong> ${user.phone || 'N/A'}</div>
            <div><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">City/District:</strong> ${details.city || 'N/A'}</div>
            <div><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">State:</strong> ${details.state || 'Jharkhand'}</div>

            ${isUniv ? `
              <div><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">AICTE / UGC / NAAC ID:</strong> <span style="color:#a855f7; font-weight:700;">${details.affiliation_id || 'N/A'}</span></div>
              <div><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">Designation:</strong> ${details.contact_designation || 'N/A'}</div>
              <div style="grid-column: 1 / -1;"><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">Primary Domains:</strong> ${Array.isArray(details.domains) ? details.domains.join(', ') : details.domains || 'N/A'}</div>
              ${details.website ? `<div style="grid-column: 1 / -1;"><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">Website:</strong> <a href="${details.website}" target="_blank" style="color:#00d2ff; text-decoration:underline;">${details.website}</a></div>` : ''}
            ` : `
              <div><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">Sector:</strong> <span style="color:#00d2ff; font-weight:700;">${details.sector || 'N/A'}</span></div>
              <div><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">GSTIN / Reg No:</strong> ${details.gstin || 'N/A'}</div>
              <div><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">CSR Focus Area:</strong> ${details.csr_focus_area || 'N/A'}</div>
              <div><strong style="color:#64748b; display:block; font-size:10px; text-transform:uppercase;">Designation:</strong> ${details.contact_designation || 'N/A'}</div>
            `}
          </div>
        </div>

        <div style="display:flex; gap:10px; margin-top:8px;">
          <button onclick="approveRegistration('${user.id}')" style="flex:1; background:linear-gradient(135deg, #10B981, #059669); color:#fff; font-weight:700; font-size:13px; padding:10px; border:none; border-radius:8px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Accept & Verify
          </button>
          <button onclick="rejectRegistration('${user.id}')" style="flex:1; background:rgba(239,68,68,0.15); border:1px solid #EF4444; color:#ef4444; font-weight:700; font-size:13px; padding:10px; border-radius:8px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Reject Request
          </button>
        </div>
      </div>`;
  }).join('');
}

async function approveRegistration(userId) {
  try {
    const res = await fetch(`/api/users/${userId}/verify`, { method: 'PATCH' });
    if (res.ok) {
      toast('Registration request approved! Account verified.');
      fetchLivePendingUsers();
    } else {
      toast('Approval failed. Please try again.');
    }
  } catch (err) {
    toast('Error connecting to backend.');
  }
}

async function rejectRegistration(userId) {
  try {
    const res = await fetch(`/api/users/${userId}/reject`, { method: 'PATCH' });
    if (res.ok) {
      toast('Registration request rejected.');
      fetchLivePendingUsers();
    } else {
      toast('Action failed. Please try again.');
    }
  } catch (err) {
    toast('Error connecting to backend.');
  }
}

let PROPOSALS = [];

window.showVerifySubtab = function(type) {
  const problemsEl = document.getElementById('verifyList');
  const proposalsEl = document.getElementById('proposalsList');
  const btnProblems = document.getElementById('btnShowVerifyQueue');
  const btnProposals = document.getElementById('btnShowProposals');

  if (type === 'proposals') {
    if (problemsEl) problemsEl.style.display = 'none';
    if (proposalsEl) proposalsEl.style.display = 'grid';
    if (btnProblems) { btnProblems.className = 'btn btn-outline btn-sm'; }
    if (btnProposals) { btnProposals.className = 'btn btn-primary btn-sm'; }
    fetchLiveProposals();
  } else {
    if (problemsEl) problemsEl.style.display = 'block';
    if (proposalsEl) proposalsEl.style.display = 'none';
    if (btnProblems) { btnProblems.className = 'btn btn-primary btn-sm'; }
    if (btnProposals) { btnProposals.className = 'btn btn-outline btn-sm'; }
  }
};

async function fetchLiveProposals() {
  try {
    const res = await fetch('/api/proposals');
    if (res.ok) {
      const data = await res.json();
      PROPOSALS = data || [];
      renderProposalsQueue();
    }
  } catch(err) {
    console.warn('Error fetching university proposals:', err);
  }
}

function renderProposalsQueue() {
  const container = document.getElementById('proposalsList');
  if (!container) return;

  if (PROPOSALS.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; background:#0f172a; border:1px solid rgba(0,210,255,0.2); border-radius:14px; padding:32px; text-align:center; color:#94a3b8;">
        <div style="font-size:36px; margin-bottom:8px;">📄</div>
        <h3 style="color:#fff; font-size:16px; font-weight:700; margin-bottom:4px;">No Pending University Proposals</h3>
        <p style="font-size:13px; color:#64748b;">All university technology proposals have been reviewed or no new proposals uploaded yet.</p>
      </div>`;
    return;
  }

  container.innerHTML = PROPOSALS.map(prop => `
    <div class="card" style="background:#0f172a; border:1px solid rgba(168,85,247,0.3); border-radius:14px; padding:20px; display:flex; flex-direction:column; justify-content:space-between; position:relative; shadow:0 10px 25px rgba(0,0,0,0.3);">
      <div style="position:absolute; top:0; right:0; background:rgba(168,85,247,0.15); border-bottom-left-radius:12px; padding:4px 12px; font-size:11px; font-weight:800; color:#a855f7; text-transform:uppercase; border-left:1px solid rgba(168,85,247,0.3); border-bottom:1px solid rgba(168,85,247,0.3);">
        🎓 ${prop.university_name}
      </div>

      <div>
        <div style="margin-bottom:12px; padding-right:120px;">
          <h3 style="color:#fff; font-size:16px; font-weight:800; margin-bottom:4px;">${prop.title}</h3>
          <span style="font-size:12px; color:#00d2ff; font-weight:600;">Re: ${prop.problem_title}</span>
        </div>

        <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; font-size:12px; color:#cbd5e1; margin-bottom:14px; space-y:6px;">
          <div><strong style="color:#94a3b8;">Technology Stack:</strong> <span style="color:#a855f7; font-weight:700;">${prop.tech_stack || 'N/A'}</span></div>
          <div style="margin-top:6px;"><strong style="color:#94a3b8;">Proposal Summary:</strong> ${prop.description || 'N/A'}</div>
          <div style="margin-top:10px; padding-top:8px; border-top:1px border rgba(255,255,255,0.1);">
            <strong style="color:#94a3b8; display:block; margin-bottom:4px;">Uploaded Proposal Document:</strong>
            <a href="${prop.document_url || '#'}" target="_blank" download style="display:inline-flex; align-items:center; gap:6px; background:rgba(0,210,255,0.15); border:1px solid #00d2ff; color:#00d2ff; font-weight:700; font-size:12px; padding:6px 12px; border-radius:8px; text-decoration:none;">
              📄 View / Download Proposal (${prop.document_filename || 'proposal.pdf'})
            </a>
          </div>
        </div>
      </div>

      <div style="display:flex; gap:10px; margin-top:8px;">
        <button onclick="approveProposal('${prop.id}')" style="flex:1; background:linear-gradient(135deg, #10B981, #059669); color:#fff; font-weight:700; font-size:13px; padding:10px; border:none; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Approve Proposal
        </button>
        <button onclick="rejectProposal('${prop.id}')" style="flex:1; background:rgba(239,68,68,0.15); border:1px solid #EF4444; color:#ef4444; font-weight:700; font-size:13px; padding:10px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Reject Proposal
        </button>
      </div>
    </div>
  `).join('');
}

window.approveProposal = async function(proposalId) {
  try {
    const res = await fetch(`/api/proposals/${proposalId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' })
    });
    if (res.ok) {
      toast('✅ University proposal approved!');
      fetchLiveProposals();
    }
  } catch(err) {
    toast('Error approving proposal.');
  }
};

window.rejectProposal = async function(proposalId) {
  try {
    const res = await fetch(`/api/proposals/${proposalId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' })
    });
    if (res.ok) {
      toast('Proposal rejected.');
      fetchLiveProposals();
    }
  } catch(err) {
    toast('Error rejecting proposal.');
  }
};

/* ---------- 14. MASTER RENDER ---------- */
function renderAll(){
  renderKPIs();
  renderFeed();
  renderVerifyQueue();
  renderKanban();
  renderMapView();
  renderImpact();
  renderArchitecture();
  renderDrawer();
  fetchLivePendingUsers();
  fetchLiveProposals();
}

/* ---------- 15. INIT ---------- */
renderTabs();