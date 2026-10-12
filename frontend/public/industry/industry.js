/* ============================================================
   YUKTI — Industry & CSR Partner Dashboard
   JavaScript controller – same architecture as admin.js
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

    /* ──────────────────────────────────────────────
       SVG icon helpers (inline, no external deps)
    ────────────────────────────────────────────── */
    const IC = {
        briefcase: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`,
        wallet: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>`,
        clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
        star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
        check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
        x: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
        eye: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
        arrow: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
        building: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>`,
        chart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
        layers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
        target: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
        users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        heart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    };

    /* ──────────────────────────────────────────────
       MOCK DATA
    ────────────────────────────────────────────── */
    const COMPANY = {
        name: "Tata Steel Foundation",
        head: "Sanjay Choudhary",
        initials: "SC",
        domains: ["Water Management", "Agriculture", "Rural Livelihood"],
        techExpertise: ["IoT", "AI/ML", "Sustainable Materials"],
        fundingCapacity: "₹40 Lakh",
        csrAreas: ["Tribal Welfare", "Rural Development", "Education"],
        location: "Jamshedpur, Jharkhand",
    };

    const MATCHED_PROJECTS = [];

    const INVESTMENTS = [];

    const IMPACT = {
        peopleImpacted: 12540,
        villagesCovered: 28,
        costSaved: "₹8.6 Lakh",
        satisfaction: "4.6/5",
        domainSpend: [
            { label: "Water", value: 38, color: "#2563EB" },
            { label: "Agriculture", value: 28, color: "#14B8A6" },
            { label: "Education", value: 15, color: "#312E81" },
            { label: "Environment", value: 12, color: "#22C55E" },
            { label: "Infrastructure", value: 7, color: "#F59E0B" },
        ],
        stageDistribution: [
            { label: "Ideation", value: 3, color: "#64748B" },
            { label: "Prototype", value: 5, color: "#2563EB" },
            { label: "Field Pilot", value: 4, color: "#14B8A6" },
            { label: "Deployed", value: 6, color: "#22C55E" },
        ],
    };

    /* ──────────────────────────────────────────────
       TABS & VIEWS
    ────────────────────────────────────────────── */
    const TABS = [
        { id: "dashboard", label: "Dashboard", icon: IC.building },
        { id: "matching", label: "Project Matching", icon: IC.target },
        { id: "investments", label: "My Investments", icon: IC.wallet },
        { id: "impact", label: "Impact Analytics", icon: IC.chart },
        { id: "project-manager", label: "🗂️ Project Management", icon: IC.briefcase, redirect: "/project-manager" },
    ];

    const tabbar = document.getElementById("tabbar");
    const drawerPanel = document.getElementById("drawerPanel");

    function buildTabs() {
        tabbar.innerHTML = "";
        TABS.forEach((t, i) => {
            const btn = document.createElement("button");
            btn.className = "tab-btn" + (i === 0 ? " active" : "");
            btn.textContent = t.label;
            btn.dataset.view = t.id;
            btn.addEventListener("click", () => switchView(t.id));
            tabbar.appendChild(btn);
        });
    }

    function buildDrawer() {
        let html = `<div class="drawer-section-label">Industry Portal</div>`;
        TABS.forEach((t, i) => {
            html += `<button class="drawer-item${i === 0 ? " active" : ""}" data-view="${t.id}">
        ${t.icon}<span class="dt-label">${t.label}</span></button>`;
        });
        html += `<div class="drawer-section-label" style="margin-top:16px;">Quick Links</div>
      <button class="drawer-item" onclick="window.location.href='/'">
        ${IC.arrow}<span class="dt-label">Back to Portal</span></button>`;
        drawerPanel.innerHTML = html;
        drawerPanel.querySelectorAll("[data-view]").forEach(btn => {
            btn.addEventListener("click", () => {
                switchView(btn.dataset.view);
                closeDrawer();
            });
        });
    }

    function switchView(id) {
        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        const el = document.getElementById("view-" + id);
        if (el) el.classList.add("active");
        tabbar.querySelectorAll(".tab-btn").forEach(b => {
            b.classList.toggle("active", b.dataset.view === id);
        });
        drawerPanel.querySelectorAll(".drawer-item[data-view]").forEach(b => {
            b.classList.toggle("active", b.dataset.view === id);
        });
    }

    /* drawer */
    const drawerBackdrop = document.getElementById("drawerBackdrop");
    document.getElementById("hamburgerBtn").addEventListener("click", () => drawerBackdrop.classList.add("open"));
    drawerBackdrop.addEventListener("click", e => { if (e.target === drawerBackdrop) closeDrawer(); });
    function closeDrawer() { drawerBackdrop.classList.remove("open"); }

    /* ──────────────────────────────────────────────
       TOAST
    ────────────────────────────────────────────── */
    const toastEl = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMsg");
    let toastTimer;
    function toast(msg) {
        toastMsg.textContent = msg;
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3000);
    }

    /* ──────────────────────────────────────────────
       MODAL
    ────────────────────────────────────────────── */
    const modalBackdrop = document.getElementById("modalBackdrop");
    const modalContent = document.getElementById("modalContent");
    function openModal(html) {
        modalContent.innerHTML = html;
        modalBackdrop.classList.add("open");
    }
    function closeModal() { modalBackdrop.classList.remove("open"); }
    modalBackdrop.addEventListener("click", e => { if (e.target === modalBackdrop) closeModal(); });

    /* ──────────────────────────────────────────────
       VIEW 1 — DASHBOARD KPIs
    ────────────────────────────────────────────── */
    function renderKPIs() {
        const kpis = [
            { label: "Active Projects", num: INVESTMENTS.filter(i => i.status === "In Progress").length + INVESTMENTS.filter(i => i.status === "Mentorship Only").length, icon: IC.briefcase, iconbg: "#EFF6FF", bar: "#2563EB", delta: "+2 this quarter", deltaColor: "#22C55E" },
            { label: "Total Funding Deployed", num: "₹15.5L", icon: IC.wallet, iconbg: "#F0FDF4", bar: "#22C55E", delta: "+₹5.2L this quarter", deltaColor: "#22C55E" },
            { label: "Mentorship Hours", num: "148", icon: IC.clock, iconbg: "#FFFBEB", bar: "#F59E0B", delta: "+32 this month", deltaColor: "#22C55E" },
            { label: "CSR Impact Score", num: "92", icon: IC.star, iconbg: "#CCFBF1", bar: "#14B8A6", delta: "Top 5% on platform", deltaColor: "#14B8A6" },
        ];

        document.getElementById("kpiGrid").innerHTML = kpis.map(k => `
      <div class="kpi-card" style="--bar:${k.bar};">
        <div class="kpi-top">
          <div class="kpi-icon" style="background:${k.iconbg};">${k.icon}</div>
        </div>
        <div class="kpi-num">${k.num}</div>
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-delta" style="color:${k.deltaColor};">${k.delta}</div>
      </div>`).join("");
    }

    /* ──────────────────────────────────────────────
       VIEW 1 — RECENT MATCHED (top 4)
    ────────────────────────────────────────────── */
    function renderRecentGrid() {
        const recent = MATCHED_PROJECTS.slice(0, 4);
        document.getElementById("recentGrid").innerHTML = recent.map(p => projectCard(p)).join("");
        bindCardActions("recentGrid");
    }

    function getAuthHeaders() {
        const token = localStorage.getItem('token') || localStorage.getItem('yukti_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('token') || sessionStorage.getItem('yukti_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    function projectCard(p) {
        const prioClass = p.priority === "Critical" ? "badge-priority-high" : p.priority === "High" ? "badge-priority-high" : "badge-priority-medium";
        const imageSrc = p.photo_url || (p.domain && p.domain.toLowerCase().includes('water') 
            ? 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800&auto=format&fit=crop&q=80'
            : (p.domain && p.domain.toLowerCase().includes('agri')
            ? 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80'));

        return `
    <div class="card" data-id="${p.id}" style="overflow:hidden; border-radius:14px; border:1px solid #334155; background:#0f172a; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 6px 18px rgba(0,0,0,0.18);">
      
      <!-- Card Image & Overlay Badges -->
      <div style="position:relative; height:150px; overflow:hidden; background:#1e293b;">
        <img src="${imageSrc}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover; opacity:0.88; transition:transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1.0)'" />
        <div style="position:absolute; top:10px; left:10px; display:flex; gap:6px; flex-wrap:wrap;">
          <span class="badge badge-domain" style="background:rgba(15,23,42,0.85); backdrop-filter:blur(4px); color:#38bdf8; border:1px solid rgba(56,189,248,0.4); font-weight:700;">${p.domain}</span>
          <span class="badge ${prioClass}" style="background:rgba(239,68,68,0.88); color:#fff; font-weight:800;">${p.priority}</span>
        </div>
        <div style="position:absolute; top:10px; right:10px;">
          <span style="font-size:11px; font-family:monospace; background:#0f172a; color:#38bdf8; padding:3px 8px; border-radius:6px; font-weight:800; border:1px solid #334155;">${p.id}</span>
        </div>
        <div style="position:absolute; bottom:8px; left:10px; display:flex; gap:6px;">
          <span style="font-size:10px; background:rgba(0,0,0,0.7); color:#4ade80; padding:2px 6px; border-radius:4px; font-weight:700;">📷 Field Photo</span>
          ${p.video_url ? `<span style="font-size:10px; background:rgba(0,0,0,0.7); color:#c084fc; padding:2px 6px; border-radius:4px; font-weight:700;">📹 Video Stream</span>` : ''}
          ${p.voice_url ? `<span style="font-size:10px; background:rgba(0,0,0,0.7); color:#fde047; padding:2px 6px; border-radius:4px; font-weight:700;">🎙️ Voice Grievance</span>` : ''}
          ${p.document_url ? `<span style="font-size:10px; background:rgba(0,0,0,0.7); color:#60a5fa; padding:2px 6px; border-radius:4px; font-weight:700;">📄 Document</span>` : ''}
        </div>
      </div>

      <!-- Card Body Content -->
      <div style="padding:16px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div class="card-title" style="margin-top:0; font-size:15px; font-weight:800; color:#f8fafc; line-height:1.4;">${p.title}</div>
          <div class="card-desc" style="font-size:12.5px; color:#94a3b8; margin-top:6px; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.description}</div>
          
          <div class="card-meta" style="margin-top:12px; font-size:11.5px; color:#cbd5e1; display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <span>🎓 <strong>Univ:</strong> ${p.university}</span>
            <span>📍 <strong>Location:</strong> ${p.location}</span>
            <span>👥 <strong>Impact:</strong> ${p.peopleAffected.toLocaleString()} citizens</span>
            <span style="color:#22c55e; font-weight:800;">💰 <strong>CSR Grant:</strong> ${p.fundingNeeded}</span>
          </div>

          <!-- Compatibility Bar -->
          <div class="compat-bar-wrap" style="margin-top:14px; background:#1e293b; padding:8px 10px; border-radius:8px; border:1px solid #334155;">
            <div class="compat-bar-label" style="font-size:11px; color:#94a3b8; font-weight:700;"><span>AI CSR Match Compatibility</span><span class="pct" style="color:#14b8a6; font-weight:800;">${p.compatibility}%</span></div>
            <div class="compat-bar-track" style="background:#0f172a; height:6px; border-radius:3px; margin-top:4px;"><div class="compat-bar-fill" style="width:${p.compatibility}%; background:linear-gradient(90deg, #14b8a6, #3b82f6); height:100%; border-radius:3px;"></div></div>
          </div>

          <div class="match-tags" style="margin-top:10px; display:flex; flex-wrap:wrap; gap:4px;">${p.matchReasons.map(r => `<span class="match-tag hit" style="font-size:10.5px; background:#1e293b; color:#38bdf8; border:1px solid #334155; padding:2px 6px; border-radius:4px;">${r}</span>`).join("")}</div>
        </div>

        <!-- Action Buttons -->
        <div class="card-actions" style="margin-top:16px; display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
          <button class="btn btn-teal btn-sm btn-accept" data-id="${p.id}" style="padding:9px 12px; font-size:11.5px; font-weight:700; width:100%; justify-content:center;">${IC.check} Commit CSR Grant</button>
          <button class="btn btn-ghost btn-sm btn-details" data-id="${p.id}" style="padding:9px 12px; font-size:11.5px; font-weight:700; width:100%; justify-content:center; background:#1e293b; color:#f8fafc; border:1px solid #334155;">${IC.eye} View Details & Proof</button>
        </div>
      </div>

    </div>`;
    }

    function bindCardActions(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.querySelectorAll(".btn-accept").forEach(btn => {
            btn.addEventListener("click", async e => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const proj = MATCHED_PROJECTS.find(x => x.id === id || x.db_id === id);
                if (proj && proj.db_id) {
                    try {
                        await fetch('/api/industries/offers', {
                            method: 'POST',
                            headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders()),
                            body: JSON.stringify({
                                problem_id: proj.db_id,
                                funding_amount: 350000,
                                offer_details: 'CSR Financial & Equipment Grant Commitment'
                            })
                        });
                    } catch(err) {
                        console.warn('CSR offer creation failed:', err);
                    }
                }
                if (proj) {
                    INVESTMENTS.unshift({
                        id: proj.id,
                        title: proj.title,
                        university: proj.university,
                        funding: proj.fundingNeeded,
                        status: "In Progress",
                        milestones: [true, false, false],
                        labels: ['CSR Approved', 'Prototype', 'Field Pilot']
                    });
                    renderInvestments();
                    renderKPIs();
                }
                toast(`✅ CSR Grant of ${proj ? proj.fundingNeeded : '₹3.5 Lakh'} committed for ${id}`);
            });
        });

        container.querySelectorAll(".btn-decline").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                toast(`Project ${btn.dataset.id} passed.`);
            });
        });

        container.querySelectorAll(".btn-details").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const proj = MATCHED_PROJECTS.find(x => x.id === id || x.db_id === id);
                if (proj) {
                    openProjectModal(proj);
                }
            });
        });
    }

    function openProjectModal(p) {
        const imageSrc = p.photo_url || (p.domain && p.domain.toLowerCase().includes('water') 
            ? 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=800&auto=format&fit=crop&q=80'
            : (p.domain && p.domain.toLowerCase().includes('agri')
            ? 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80'));

        openModal(`
      <div style="background:#0f172a; color:#f8fafc; border-radius:14px; overflow:hidden; border:1px solid #334155;">
        <div class="modal-head" style="background:#1e293b; padding:18px 22px; border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:6px;">
              <span class="badge" style="background:#38bdf8; color:#0f172a; font-family:monospace; font-weight:800; padding:3px 8px; border-radius:6px; font-size:11px;">${p.id}</span>
              <span class="badge" style="background:#334155; color:#fff; font-weight:700; padding:3px 8px; border-radius:6px; font-size:11px;">${p.domain}</span>
              <span class="badge" style="background:#ef4444; color:#fff; font-weight:800; padding:3px 8px; border-radius:6px; font-size:11px;">${p.priority} Priority</span>
              <span class="badge" style="background:#14b8a6; color:#0f172a; font-weight:800; padding:3px 8px; border-radius:6px; font-size:11px;">AI CSR Match: ${p.compatibility}%</span>
            </div>
            <h3 style="font-size:17px; font-weight:800; color:#fff; margin:0;">${p.title}</h3>
          </div>
          <button class="modal-close" onclick="document.getElementById('modalBackdrop').classList.remove('open')" style="color:#94a3b8; font-size:20px; background:none; border:none; cursor:pointer;">✕</button>
        </div>

        <div class="modal-body" style="padding:22px; max-height:75vh; overflow-y:auto;">
          
          <!-- Metadata Grid -->
          <div style="background:#1e293b; border:1px solid #334155; padding:14px 18px; border-radius:10px; font-size:12.5px; margin-bottom:18px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div><strong style="color:#94a3b8;">Submitted By:</strong> <span style="color:#f8fafc; font-weight:600;">${p.citizenName || 'Citizen Representative'}</span></div>
            <div><strong style="color:#94a3b8;">Subdomain / Sector:</strong> <span style="color:#f8fafc; font-weight:600;">${p.subdomain || 'General'}</span></div>
            <div><strong style="color:#94a3b8;">Location:</strong> <span style="color:#f8fafc; font-weight:600;">📍 ${p.location}</span></div>
            <div><strong style="color:#94a3b8;">Population Affected:</strong> <span style="color:#f8fafc; font-weight:600;">👥 ${p.peopleAffected.toLocaleString()} citizens</span></div>
            <div><strong style="color:#94a3b8;">Executing Univ R&D:</strong> <span style="color:#38bdf8; font-weight:700;">🎓 ${p.university}</span></div>
            <div><strong style="color:#94a3b8;">Required CSR Funding:</strong> <span style="color:#4ade80; font-weight:800;">💰 ${p.fundingNeeded}</span></div>
            <div style="grid-column: 1 / -1;">
              <strong style="color:#94a3b8;">GPS Coordinates:</strong> <span style="font-family:monospace; color:#cbd5e1;">${p.lat || 23.3441}° N, ${p.lng || 85.3096}° E</span>
              <a href="https://maps.google.com/?q=${p.lat || 23.3441},${p.lng || 85.3096}" target="_blank" style="margin-left:10px; color:#38bdf8; font-weight:bold; text-decoration:underline;">📍 Open Live Map</a>
            </div>
          </div>

          <!-- Problem Description -->
          <div style="margin-bottom:18px;">
            <h4 style="font-size:13px; font-weight:800; color:#38bdf8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Detailed Problem Description & Narrative</h4>
            <div style="font-size:13px; color:#cbd5e1; line-height:1.6; background:#1e293b; padding:14px; border:1px solid #334155; border-radius:10px;">${p.description}</div>
          </div>

          <!-- Ground Proof Evidence & Media Attachments -->
          <div style="margin-bottom:18px;">
            <h4 style="font-size:13px; font-weight:800; color:#38bdf8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">🖼️ Ground Proof Evidence & Media Attachments</h4>
            
            <div style="margin-bottom:12px;">
              <span style="font-size:11px; font-weight:700; color:#94a3b8; display:block; margin-bottom:4px;">📷 Geotagged Field Evidence Photo:</span>
              <img src="${imageSrc}" alt="Field Evidence" style="width:100%; max-height:260px; object-fit:cover; border-radius:10px; border:1px solid #334155; box-shadow:0 4px 12px rgba(0,0,0,0.2);" />
            </div>

            <div style="display:grid; grid-template-columns:1fr; gap:10px;">
              ${p.video_url ? `
                <div style="background:#1e1b4b; border:1px solid #4338ca; padding:12px; border-radius:8px;">
                  <span style="font-size:11px; font-weight:800; color:#a5b4fc; display:block; margin-bottom:6px;">📹 Video Stream Proof:</span>
                  <video src="${p.video_url}" controls style="width:100%; border-radius:6px; max-height:180px;"></video>
                </div>
              ` : ''}

              <div style="background:#1e293b; border:1px solid #334155; padding:12px; border-radius:8px;">
                <span style="font-size:11px; font-weight:800; color:#fde047; display:block; margin-bottom:4px;">🎙️ Voice Grievance Recording:</span>
                <div style="font-size:12px; font-style:italic; color:#cbd5e1;">Original citizen voice captured via AI Voice Assistant</div>
              </div>

              ${p.document_url ? `
                <div style="background:#064e3b; border:1px solid #047857; padding:12px; border-radius:8px;">
                  <span style="font-size:11px; font-weight:800; color:#6ee7b7; display:block; margin-bottom:6px;">📄 Document Evidence Attachment:</span>
                  <a href="${p.document_url}" target="_blank" download style="display:inline-block; background:#059669; color:#fff; font-weight:bold; font-size:11px; padding:6px 14px; border-radius:6px; text-decoration:none;">📥 View / Download Document File</a>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- AI Match Reasons -->
          <div>
            <h4 style="font-size:12px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; font-weight:700; margin-bottom:6px;">AI CSR Strategic Match Factors</h4>
            <div class="match-tags" style="display:flex; flex-wrap:wrap; gap:6px;">${p.matchReasons.map(r => `<span class="match-tag hit" style="background:#1e293b; color:#38bdf8; border:1px solid #334155; padding:4px 10px; border-radius:6px; font-size:11.5px;">${r}</span>`).join("")}</div>
          </div>

        </div>

        <div class="modal-footer" style="padding:14px 22px; background:#1e293b; border-top:1px solid #334155; display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-ghost" onclick="document.getElementById('modalBackdrop').classList.remove('open')" style="background:#334155; color:#fff;">Close</button>
          <button class="btn btn-teal" onclick="document.getElementById('modalBackdrop').classList.remove('open'); const btn = document.querySelector('.btn-accept[data-id=\\'${p.id}\\']'); if (btn) btn.click();" style="font-weight:800; padding:10px 20px;">${IC.check} Commit CSR Grant (${p.fundingNeeded})</button>
        </div>
      </div>
    `);
    }

    /* ──────────────────────────────────────────────
       VIEW 2 — PROJECT MATCHING
    ────────────────────────────────────────────── */
    let currentFilter = "All";
    function renderMatchingView() {
        const domains = ["All", ...new Set(MATCHED_PROJECTS.map(p => p.domain))];
        document.getElementById("matchFilters").innerHTML = domains.map(d =>
            `<button class="chip${d === currentFilter ? " active" : ""}" data-domain="${d}">${d}</button>`
        ).join("");

        document.getElementById("matchFilters").querySelectorAll(".chip").forEach(chip => {
            chip.addEventListener("click", () => {
                currentFilter = chip.dataset.domain;
                renderMatchingView();
            });
        });

        const filtered = currentFilter === "All" ? MATCHED_PROJECTS : MATCHED_PROJECTS.filter(p => p.domain === currentFilter);
        document.getElementById("matchGrid").innerHTML = filtered.map(p => projectCard(p)).join("");
        bindCardActions("matchGrid");
    }

    /* ──────────────────────────────────────────────
       VIEW 3 — INVESTMENTS TABLE & CSR CERTIFICATE
    ────────────────────────────────────────────── */
    window.downloadCsrCertificate = function (projId) {
        const inv = INVESTMENTS.find(i => i.id === projId) || {
            id: projId || "YUKTI-CSR-8712",
            title: "Solar Cold-Storage for Tribal Horticulture — Giridih",
            university: "Birsa Agricultural University",
            funding: "₹5,20,000",
            status: "In Progress"
        };

        openModal(`
          <div style="font-family:sans-serif; padding:16px; background:#fff; border-radius:12px; border:2px solid #312e81;">
            <div style="text-align:center; border-bottom:2px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
              <h2 style="margin:0; color:#312e81; font-size:20px; font-weight:800;">GOVERNMENT OF JHARKHAND</h2>
              <p style="margin:2px 0 0 0; font-size:12px; color:#475569; font-weight:700;">YUKTI — Societal Innovation Collaboration Portal</p>
              <h3 style="margin:8px 0 0 0; color:#2563eb; font-size:16px; text-transform:uppercase;">Certificate of CSR Contribution & Tax Compliance</h3>
              <p style="margin:2px 0 0 0; font-size:10px; color:#64748b;">(Under Section 135 of the Companies Act, 2013)</p>
            </div>

            <div style="font-size:13px; color:#1e293b; line-height:1.6; space-y:8px;">
              <p>This is to certify that <strong>${COMPANY.name}</strong> (represented by ${COMPANY.head}) has officially committed and deployed CSR financial and mentorship support for the societal innovation project:</p>
              <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:10px; border-radius:8px; margin:10px 0;">
                <p style="margin:0; font-weight:bold; color:#0f172a;">Project ID: ${inv.id}</p>
                <p style="margin:2px 0 0 0; font-weight:600; color:#2563eb;">${inv.title}</p>
                <p style="margin:2px 0 0 0; font-size:12px; color:#475569;">Executing Institution: ${inv.university}</p>
                <p style="margin:2px 0 0 0; font-size:12px; color:#16a34a; font-weight:bold;">CSR Grant Value: ${inv.funding}</p>
              </div>
              <p style="font-size:11px; color:#64748b;">This certificate serves as official proof for CSR Expenditure Accounting, Section 135 Compliance, and State Innovation Ecosystem Recognition.</p>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:24px; padding-top:12px; border-top:1px dashed #cbd5e1;">
              <div>
                <p style="font-size:10px; color:#94a3b8; margin:0;">Certificate ID: YKT-CSR-${Math.floor(100000 + Math.random()*900000)}</p>
                <p style="font-size:10px; color:#94a3b8; margin:0;">Date of Issue: ${new Date().toLocaleDateString('en-IN')}</p>
              </div>
              <div style="text-align:right;">
                <p style="margin:0; font-size:12px; font-weight:bold; color:#312e81;">State Nodal Officer</p>
                <p style="margin:0; font-size:10px; color:#475569;">Dept of Higher Education & Innovation</p>
              </div>
            </div>

            <div style="margin-top:20px; text-align:center;" class="no-print">
              <button class="btn btn-teal" onclick="window.print();" style="margin-right:8px;">🖨️ Print / Download PDF</button>
              <button class="btn btn-ghost" onclick="document.getElementById('modalBackdrop').classList.remove('open')">Close</button>
            </div>
          </div>
        `);
    };

    function renderInvestments() {
        const body = document.getElementById("invBody");
        body.innerHTML = INVESTMENTS.map(inv => {
            const statusClass = inv.status === "Completed" ? "badge-status-completed"
                : inv.status === "In Progress" ? "badge-status-active"
                    : "badge-status-review";

            const milestoneBars = (inv.milestones || [true, true, false]).map((done, i) =>
                `<span class="${done ? "done" : ""}" title="${(inv.labels && inv.labels[i]) || 'Milestone'}"></span>`
            ).join("");

            const completedCount = (inv.milestones || []).filter(Boolean).length;

            return `<tr>
        <td>
          <div class="proj-name">${inv.title}</div>
          <div class="proj-id">${inv.id}</div>
        </td>
        <td>${inv.university}</td>
        <td style="font-weight:700;">${inv.funding}</td>
        <td><span class="badge ${statusClass}">${inv.status}</span></td>
        <td>
          <div style="font-size:11px;color:var(--ink-soft);font-weight:600;">${completedCount}/${(inv.milestones || []).length || 5} completed</div>
          <div class="milestone-bar">${milestoneBars}</div>
        </td>
        <td>
          <button class="btn btn-teal btn-sm" onclick="downloadCsrCertificate('${inv.id}')">
            📜 CSR Certificate
          </button>
        </td>
      </tr>`;
        }).join("");
    }

    // Async fetch live projects from backend if connected
    async function fetchLiveProjects() {
        try {
            const res = await fetch('/api/problems?status_filter=verified', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                MATCHED_PROJECTS.length = 0;
                data.forEach(p => {
                    MATCHED_PROJECTS.push({
                        id: p.id ? `YKT-${p.id.substring(0, 6).toUpperCase()}` : 'YKT-100',
                        db_id: p.id,
                        title: p.title,
                        domain: p.domain || 'Urban Infrastructure',
                        subdomain: p.subdomain || 'Infrastructure Management',
                        priority: p.priority ? (p.priority.charAt(0).toUpperCase() + p.priority.slice(1)) : 'Medium',
                        university: p.status === 'matched' ? 'BIT Mesra / PAU' : (p.assigned_university || 'RGPV Nodal Center'),
                        location: p.location_text || 'Ranchi, Jharkhand',
                        lat: p.latitude || 23.3441,
                        lng: p.longitude || 85.3096,
                        fundingNeeded: '₹3.5 Lakh',
                        compatibility: p.priority === 'critical' ? 95 : (p.priority === 'high' ? 88 : 78),
                        matchReasons: [p.domain || 'Urban Infrastructure', 'CSR Priority', 'High Impact'],
                        description: p.description,
                        photo_url: p.photo_url,
                        video_url: p.video_url,
                        voice_url: p.voice_url,
                        document_url: p.document_url,
                        citizenName: 'Citizen Representative',
                        peopleAffected: p.population_affected ? (parseInt(p.population_affected) || 5000) : 5000
                    });
                });
                renderRecentGrid();
                renderMatchingView();
            }
          }
        } catch (e) {}
    }
    fetchLiveProjects();

    /* ──────────────────────────────────────────────
       VIEW 4 — IMPACT ANALYTICS (DYNAMIC FASTAPI FETCH)
    ────────────────────────────────────────────── */
    async function fetchLiveImpactAnalytics() {
        const dist = document.getElementById("impactDistrictFilter")?.value || "all";
        const sec = document.getElementById("impactSectorFilter")?.value || "all";
        const st = document.getElementById("impactStatusFilter")?.value || "all";

        try {
            const queryParams = new URLSearchParams();
            if (dist !== "all") queryParams.append("district", dist);
            if (sec !== "all") queryParams.append("sector", sec);
            if (st !== "all") queryParams.append("status", st);

            const token = localStorage.getItem("token") || localStorage.getItem("access_token") || localStorage.getItem("yukti_token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`/api/industry/analytics/impact?${queryParams.toString()}`, { headers });
            
            if (res.ok) {
                const data = await res.json();
                renderImpactAnalyticsData(data);
                return;
            }
        } catch (e) {
            console.warn("Failed to fetch live industry analytics, falling back to cached model:", e);
        }
        renderImpact();
    }
    window.fetchLiveImpactAnalytics = fetchLiveImpactAnalytics;

    function renderImpactAnalyticsData(data) {
        // Render KPI Strip
        const kpiGrid = document.getElementById("impactKpiGrid");
        if (kpiGrid && data.kpis) {
            const kpis = [
                { label: "Total CSR Investment", num: data.kpis.formatted_investment, sub: "Allocated across active programs", bar: "#2563EB" },
                { label: "Projects Supported", num: `${data.kpis.projects_supported} Projects`, sub: "100% verified & matched to university teams", bar: "#14B8A6" },
                { label: "Lives & Citizens Impacted", num: data.kpis.lives_impacted.toLocaleString(), sub: "Verified direct & indirect beneficiaries", bar: "#F59E0B" },
                { label: "Partner Universities", num: `${data.kpis.partner_universities} Institutions`, sub: "BIT Mesra, BAU, IIT(ISM) Dhanbad, etc.", bar: "#10B981" },
                { label: "Rural Communities Reached", num: `${data.kpis.rural_communities} Villages`, sub: "78.5% total impact in rural/tribal blocks", bar: "#8B5CF6" },
                { label: "CSR Cost Efficiency", num: "94.2% Direct Impact", sub: "Minimal overhead via YUKTI digital matching", bar: "#EC4899" },
            ];
            kpiGrid.innerHTML = kpis.map(k => `
                <div class="kpi-card" style="--bar:${k.bar};background:#0f172a;border:1px solid #1e293b;padding:16px;border-radius:12px;">
                    <div class="kpi-label" style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">${k.label}</div>
                    <div class="kpi-num" style="font-size:22px;font-weight:800;color:#f8fafc;margin:4px 0;">${k.num}</div>
                    <div class="kpi-delta" style="font-size:11px;color:#94a3b8;">${k.sub}</div>
                </div>
            `).join("");
        }

        // Render Investment Breakdown Bars
        const domainBars = document.getElementById("domainBars");
        if (domainBars && data.investment_breakdown) {
            const maxVal = Math.max(...data.investment_breakdown.map(d => d.percentage), 1);
            domainBars.innerHTML = data.investment_breakdown.map(d => `
                <div class="bar-wrap" style="margin-bottom:12px;">
                    <div style="display:flex;justify-space-between;font-size:12px;font-weight:700;color:#e2e8f0;margin-bottom:4px;">
                        <span>${d.category}</span>
                        <span>₹${(d.amount_inr / 100000).toFixed(2)} Lakhs (${d.percentage}%)</span>
                    </div>
                    <div style="height:10px;background:#020617;border-radius:6px;overflow:hidden;">
                        <div style="height:100%;width:${d.percentage}%;background:${d.color};border-radius:6px;transition:all 0.5s;"></div>
                    </div>
                </div>
            `).join("");
        }

        // Render Impact Areas List
        const impactAreasList = document.getElementById("impactAreasList");
        if (impactAreasList && data.impact_areas) {
            impactAreasList.innerHTML = data.impact_areas.map(a => `
                <div style="background:#020617;border:1px solid #1e293b;padding:10px 14px;border-radius:10px;display:flex;align-items:center;justify-content:space-between;">
                    <div>
                        <div style="font-size:13px;font-weight:700;color:#f8fafc;">${a.domain}</div>
                        <div style="font-size:11px;color:#94a3b8;">${a.unit}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:16px;font-weight:800;color:#14b8a6;">${a.beneficiaries_count.toLocaleString()}</div>
                        <div style="font-size:10px;color:#64748b;">Beneficiaries</div>
                    </div>
                </div>
            `).join("");
        }

        // Render Tangible Outcomes Grid
        const tangibleOutcomesGrid = document.getElementById("tangibleOutcomesGrid");
        if (tangibleOutcomesGrid && data.key_outcomes) {
            tangibleOutcomesGrid.innerHTML = data.key_outcomes.map(o => `
                <div style="background:#020617;border:1px solid #1e293b;padding:14px;border-radius:10px;">
                    <div style="font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;">${o.type}</div>
                    <div style="font-size:18px;font-weight:800;color:#10b981;margin:4px 0;">${o.value}</div>
                    <div style="font-size:11px;color:#cbd5e1;">${o.description}</div>
                </div>
            `).join("");
        }

        // Render Social Indicators Table
        const socialTable = document.getElementById("socialIndicatorsTable");
        if (socialTable && data.social_indicators) {
            socialTable.innerHTML = `
                <table style="width:100%;text-align:left;font-size:12px;color:#cbd5e1;border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid #334155;color:#94a3b8;font-size:11px;text-transform:uppercase;">
                            <th style="padding:8px;">Indicator Name</th>
                            <th style="padding:8px;">Baseline</th>
                            <th style="padding:8px;">Current</th>
                            <th style="padding:8px;">Net Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.social_indicators.map(ind => `
                            <tr style="border-bottom:1px solid #1e293b;">
                                <td style="padding:8px;font-weight:700;color:#f8fafc;">${ind.name}</td>
                                <td style="padding:8px;color:#94a3b8;">${ind.baseline}</td>
                                <td style="padding:8px;font-weight:700;color:#14b8a6;">${ind.current}</td>
                                <td style="padding:8px;">
                                    <span style="background:rgba(20,184,166,0.15);color:#14b8a6;padding:2px 8px;border-radius:10px;font-weight:700;font-size:11px;">
                                        ${ind.change_pct > 0 ? '+' + ind.change_pct + '%' : ind.change_pct + '%'}
                                    </span>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
        }

        // Render Field Challenges List
        const challengesList = document.getElementById("fieldChallengesList");
        if (challengesList && data.challenges) {
            challengesList.innerHTML = data.challenges.map(ch => `
                <div style="background:#020617;border:1px solid #1e293b;padding:12px;border-radius:10px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-size:13px;font-weight:700;color:#f8fafc;">${ch.title}</span>
                        <span style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);padding:2px 6px;border-radius:4px;font-size:10px;font-weight:800;text-transform:uppercase;">
                            ${ch.severity} Risk
                        </span>
                    </div>
                    <p style="font-size:11px;color:#94a3b8;margin:0 0 6px 0;">${ch.description}</p>
                    <div style="font-size:11px;color:#14b8a6;border-top:1px solid #1e293b;padding-top:4px;">
                        <strong style="color:#e2e8f0;">Action Taken: </strong>${ch.action_taken}
                    </div>
                </div>
            `).join("");
        }
    }

    function renderImpact() {
        fetchLiveImpactAnalytics();
    }

    /* ──────────────────────────────────────────────
       VIEW 5 — ARCHITECTURE & PITCH
    ────────────────────────────────────────────── */
    function renderArchitecture() {
        const flow = [
            { t: "Citizen Reports", s: "Problem submitted with photo, description & location" },
            { t: "AI Classification", s: "Domain, priority, duplicates detected automatically" },
            { t: "Admin Verification", s: "Govt officer confirms authenticity & merges dups" },
            { t: "University Match", s: "Best-fit department assigned by expertise + proximity" },
            { t: "Industry Match", s: "CSR partner matched by domain, funding & tech capacity" },
            { t: "Project Execution", s: "Student team + mentor + funding build the solution" },
            { t: "Impact Tracking", s: "People impacted, cost saved, satisfaction measured" },
        ];

        document.getElementById("archFlow").innerHTML = flow.map((n, i) =>
            (i > 0 ? '<div class="arch-arrow">→</div>' : '') +
            `<div class="arch-node"><div class="t">${n.t}</div><span class="s">${n.s}</span></div>`
        ).join("");

        document.getElementById("whyList").innerHTML = [
            "Direct CSR-to-impact pipeline — fund real, verified problems, not abstract proposals.",
            "AI matching ensures your funding goes to projects aligned with your expertise and CSR focus.",
            "Transparent milestone tracking — see exactly where your money is going.",
            "Measurable outcomes: people impacted, cost saved, satisfaction scores, deployment stats.",
            "University partnerships mean you're funding research-backed solutions, not guesswork.",
            "Platform handles discovery, matching, and reporting — you just pick and fund.",
        ].map(t => `<li>${t}</li>`).join("");

        document.getElementById("csrModelList").innerHTML = [
            "CSR spend directly mapped to SDG-aligned projects with government verification.",
            "Quarterly impact reports auto-generated from platform data — no manual effort.",
            "Mentorship track: contribute expertise hours alongside (or instead of) funding.",
            "Multi-company co-funding: large projects can have multiple industry backers.",
            "Tax-compliant CSR documentation built into the platform workflow.",
            "Public CSR impact dashboard showcasing your company's contribution to society.",
        ].map(t => `<li>${t}</li>`).join("");
    }

    /* ──────────────────────────────────────────────
       INIT
    ────────────────────────────────────────────── */
    buildTabs();
    buildDrawer();
    renderKPIs();
    renderRecentGrid();
    renderMatchingView();
    renderInvestments();
    renderImpact();
    renderArchitecture();

});
