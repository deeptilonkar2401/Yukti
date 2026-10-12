const citizenProblems = [];
let claimedProjects = [];
let acceptedProblemIds = new Set();
let teamFormedSet = new Set();
const proposalMap = new Map();
const teamDetailsMap = new Map(); // problem_id -> team details { mentor, dept, members }

let currentDomainFilter = 'all';
let currentStatusFilter = 'all';
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    fetchLiveUniversityProblems();
});

function getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('yukti_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('token') || sessionStorage.getItem('yukti_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchLiveUniversityProblems() {
    try {
        const propRes = await fetch('/api/proposals', { headers: getAuthHeaders() });
        if (propRes.ok) {
            const propData = await propRes.json();
            if (Array.isArray(propData)) {
                propData.forEach(p => {
                    proposalMap.set(p.problem_id, p);
                });
            }
        }
    } catch(err) {
        console.warn('Could not load proposals:', err);
    }

    try {
        const res = await fetch('/api/problems');
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
            citizenProblems.length = 0;
            data.forEach(p => {
                const uniqueCode = p.id ? `YKT-${p.id.substring(0, 6).toUpperCase()}` : 'YKT-100';
                const prop = proposalMap.get(p.id);
                const isTeamFormed = teamFormedSet.has(uniqueCode) || p.status === 'in_progress';

                citizenProblems.push({
                    id: uniqueCode,
                    db_id: p.id,
                    title: p.title,
                    category: p.domain || 'Urban Infrastructure',
                    subdomain: p.subdomain || 'Infrastructure Management',
                    priority: p.priority ? (p.priority.charAt(0).toUpperCase() + p.priority.slice(1)) : 'Medium',
                    aiPriorityScore: p.priority === 'critical' ? 95 : (p.priority === 'high' ? 88 : 75),
                    status: p.status === 'submitted' ? 'AI Matched — Pending Review' : (p.status || 'Verified'),
                    district: p.location_text ? p.location_text.split(',')[0] : 'Ranchi',
                    state: p.location_text && p.location_text.includes(',') ? p.location_text.split(',')[1].trim() : 'Jharkhand',
                    citizenName: 'Citizen Representative',
                    lat: p.latitude || 23.3441,
                    lng: p.longitude || 85.3096,
                    population: p.population_affected || '100+ Citizens',
                    description: p.description,
                    photo_url: p.photo_url,
                    video_url: p.video_url,
                    voice_url: p.voice_url,
                    document_url: p.document_url,
                    votes: p.votes || 124,
                    proposalStatus: prop ? prop.status : (p.status === 'in_progress' ? 'approved' : 'none'),
                    proposalTitle: prop ? prop.title : null,
                    teamFormed: isTeamFormed,
                    isIndustryFunded: p.status === 'in_progress' || (prop && prop.status === 'approved'),
                    industrySupport: {
                        funding: '30% Milestone Released (₹1.5 Lakhs)',
                        equipment: 'IoT Sensor Node Kit',
                        mentor: 'Er. R. K. Varma (Tech Lead)'
                    }
                });
            });
            loadProblemFeed();
            populateSelects();
            renderPipeline();
        }
      }
    } catch(e) {
        console.warn('Could not load live problems:', e);
    }
}

// Tab Navigation Switcher
function switchTab(tabId, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        const btnMap = {
            'dashboard-view': 0,
            'citizen-feed-view': 1,
            'university-workspace-view': 2,
            'progress-tracking-view': 3,
            'project-management-view': 4,
            'funding-workflow-view': 4
        };
        const tabs = document.querySelectorAll('.nav-tab');
        if (btnMap[tabId] !== undefined && tabs[btnMap[tabId]]) {
            tabs[btnMap[tabId]].classList.add('active');
        }
    }
    if (tabId === 'citizen-feed-view') {
        setTimeout(() => {
            if (univMapInstance) univMapInstance.invalidateSize();
            else initUniversityMap();
        }, 100);
    }
}

// Filter Control Handlers
window.onSearchInput = function(e) {
    currentSearchQuery = e.target.value.trim().toLowerCase();
    loadProblemFeed();
};

window.setDomainFilter = function(domain, event) {
    currentDomainFilter = domain;
    const container = document.getElementById('domain-filter-pills');
    if (container) {
        container.querySelectorAll('.pill').forEach(btn => btn.classList.remove('active'));
    }
    if (event && event.target) event.target.classList.add('active');
    loadProblemFeed();
};

window.setStatusFilter = function(status, event) {
    currentStatusFilter = status;
    const container = document.getElementById('status-filter-pills');
    if (container) {
        container.querySelectorAll('.pill').forEach(btn => btn.classList.remove('active'));
    }
    if (event && event.target) event.target.classList.add('active');
    loadProblemFeed();
};

window.resetFeedFilters = function() {
    currentDomainFilter = 'all';
    currentStatusFilter = 'all';
    currentSearchQuery = '';

    const searchInput = document.getElementById('problem-id-search');
    if (searchInput) searchInput.value = '';

    const domainContainer = document.getElementById('domain-filter-pills');
    if (domainContainer) {
        domainContainer.querySelectorAll('.pill').forEach(btn => btn.classList.remove('active'));
        if (domainContainer.children[0]) domainContainer.children[0].classList.add('active');
    }

    const statusContainer = document.getElementById('status-filter-pills');
    if (statusContainer) {
        statusContainer.querySelectorAll('.pill').forEach(btn => btn.classList.remove('active'));
        if (statusContainer.children[0]) statusContainer.children[0].classList.add('active');
    }

    loadProblemFeed();
};

// Render Feed Cards & Overview AI Matched Requests
function loadProblemFeed() {
    const grid = document.getElementById('feed-problem-grid');
    const overviewList = document.getElementById('overview-problem-list');
    if (grid) grid.innerHTML = '';
    if (overviewList) overviewList.innerHTML = '';

    const filteredProblems = citizenProblems.filter(prob => {
        if (currentSearchQuery) {
            const matchesId = prob.id.toLowerCase().includes(currentSearchQuery);
            const matchesDbId = prob.db_id ? prob.db_id.toLowerCase().includes(currentSearchQuery) : false;
            const matchesTitle = prob.title.toLowerCase().includes(currentSearchQuery);
            if (!matchesId && !matchesDbId && !matchesTitle) return false;
        }

        if (currentDomainFilter !== 'all') {
            if (prob.category.toLowerCase().trim() !== currentDomainFilter.toLowerCase().trim()) {
                return false;
            }
        }

        if (currentStatusFilter !== 'all') {
            if (currentStatusFilter === 'proposal_pending' && prob.proposalStatus !== 'pending') return false;
            if (currentStatusFilter === 'proposal_approved' && prob.proposalStatus !== 'approved') return false;
            if (currentStatusFilter === 'in_progress' && prob.status !== 'in_progress' && !prob.teamFormed) return false;
            if (currentStatusFilter === 'industry_funded' && !prob.isIndustryFunded) return false;
            if (currentStatusFilter === 'completed' && prob.status !== 'completed') return false;
        }

        return true;
    });

    if (grid) {
        if (filteredProblems.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 40px; text-align: center; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">🔍</div>
                    <h3 style="color: #334155; margin-bottom: 6px;">No Problems Found</h3>
                    <p style="color: #64748b; font-size: 0.9rem;">No citizen problems match the selected search query or filters.</p>
                    <button class="btn-secondary" onclick="resetFeedFilters()" style="margin-top: 14px; background: #1e3a8a; color: white;">Clear All Filters</button>
                </div>
            `;
        } else {
            filteredProblems.forEach(prob => {
                let actionButtonHTML = '';

                if (prob.proposalStatus === 'approved' && prob.teamFormed) {
                    actionButtonHTML = `<button class="btn-primary" style="padding:6px 14px; font-size:0.8rem; background:#2563eb; font-weight:700;" onclick="event.stopPropagation(); goToCompleteRecords('${prob.id}')">📊 Complete Records</button>`;
                } else if (prob.proposalStatus === 'approved' && !prob.teamFormed) {
                    actionButtonHTML = `<button class="btn-primary" style="padding:6px 14px; font-size:0.8rem; background:#10b981; font-weight:700;" onclick="event.stopPropagation(); goToTeamFormation('${prob.id}')">👥 Team Formation</button>`;
                } else if (prob.proposalStatus === 'pending') {
                    actionButtonHTML = `<span class="badge" style="background:#fef3c7; color:#b45309; padding:6px 12px; font-size:0.8rem; font-weight:700; border-radius:6px; border:1px solid #fde68a;">⏳ Proposal Under Verification</span>`;
                } else {
                    actionButtonHTML = `<button class="btn-primary" style="padding:6px 14px; font-size:0.8rem; background:#4f46e5; font-weight:700;" onclick="event.stopPropagation(); openProposalModal('${prob.id}')">📜 Submit Proposal (Upload Doc)</button>`;
                }

                const cardHTML = `
                    <div class="feed-card" onclick="openProblemModal('${prob.id}')" style="border:1px solid #e2e8f0; border-radius:12px; padding:18px; background:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.04); display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <span class="badge badge-blue">${prob.category}</span>
                                <span style="background:#f1f5f9; color:#475569; font-weight:800; font-size:11px; padding:4px 8px; border-radius:6px; font-family:monospace; border:1px solid #e2e8f0;">ID: ${prob.id}</span>
                            </div>
                            <h3 style="font-size:1.05rem; font-weight:700; color:#0f172a; margin-bottom:6px; line-height:1.4;">${prob.title}</h3>
                            <div class="location-tag" style="font-size:0.8rem; color:#64748b; margin-bottom:10px;">📍 ${prob.district}, ${prob.state} | By: ${prob.citizenName}</div>
                            <p style="font-size: 0.85rem; color: #475569; margin-bottom:14px; line-height:1.5;">${prob.description.substring(0, 120)}...</p>
                        </div>
                        
                        <div style="border-top:1px solid #f1f5f9; padding-top:12px; display:flex; gap:8px; align-items:center; justify-content:space-between;">
                            <button class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;" onclick="event.stopPropagation(); openProblemModal('${prob.id}')">View Details</button>
                            ${actionButtonHTML}
                        </div>
                    </div>
                `;
                grid.innerHTML += cardHTML;
            });
        }
    }

    // Overview AI Matched List Cards with Synced Dynamic Actions
    if (overviewList) {
        citizenProblems.forEach(prob => {
            const isAccepted = acceptedProblemIds.has(prob.id) || prob.status === 'in_progress';
            let overviewActionHTML = '';

            if (isAccepted) {
                if (prob.proposalStatus === 'approved' && prob.teamFormed) {
                    overviewActionHTML = `
                        <span style="color:#059669; font-weight:bold; font-size:0.85rem;">✅ Active R&amp;D Track</span>
                        <button class="btn-primary" style="padding:6px 12px; font-size:0.8rem; background:#2563eb; margin-left:auto;" onclick="event.stopPropagation(); goToCompleteRecords('${prob.id}')">📊 View Report</button>
                    `;
                } else if (prob.proposalStatus === 'approved' && !prob.teamFormed) {
                    overviewActionHTML = `
                        <span style="color:#059669; font-weight:bold; font-size:0.85rem;">✅ Proposal Approved by Admin</span>
                        <button class="btn-primary" style="padding:6px 12px; font-size:0.8rem; background:#10b981; margin-left:auto;" onclick="event.stopPropagation(); goToTeamFormation('${prob.id}')">👥 Team Formation</button>
                    `;
                } else if (prob.proposalStatus === 'pending') {
                    overviewActionHTML = `
                        <span style="color:#b45309; font-weight:bold; font-size:0.85rem;">⏳ Proposal Under Admin Review</span>
                        <span class="badge" style="background:#fef3c7; color:#b45309; padding:6px 12px; font-size:0.8rem; font-weight:700; margin-left:auto;">Verification Pending</span>
                    `;
                } else {
                    overviewActionHTML = `
                        <span style="color:#059669; font-weight:bold; font-size:0.85rem;">✅ Challenge Accepted — Open in Feed</span>
                        <button class="btn-primary" style="padding:6px 12px; font-size:0.8rem; background:#4f46e5; margin-left:auto;" onclick="event.stopPropagation(); openProposalModal('${prob.id}')">📜 Upload Tech Proposal</button>
                    `;
                }
            } else {
                overviewActionHTML = `
                    <button class="btn-primary" style="padding:8px 16px; font-size:0.85rem; background:#10b981;" onclick="event.stopPropagation(); acceptProblemMatch('${prob.id}')">Accept Challenge</button>
                    <button class="btn-secondary" style="padding:8px 16px; font-size:0.85rem; color:#ef4444; border-color:#ef4444;" onclick="event.stopPropagation(); declineProblemMatch('${prob.id}')">Decline</button>
                    <button class="btn-secondary" style="padding:8px 16px; font-size:0.85rem; margin-left:auto;" onclick="event.stopPropagation(); openProblemModal('${prob.id}')">View Details</button>
                `;
            }

            const overviewCardHTML = `
                <div class="feed-card" onclick="openProblemModal('${prob.id}')" style="border:1px solid #cbd5e1; border-radius:12px; padding:16px; margin-bottom:14px; background:#fff; cursor:pointer;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span class="badge badge-blue">${prob.category}</span>
                        <span style="background:#e0e7ff; color:#3730a3; font-size:11px; font-weight:800; padding:3px 8px; border-radius:12px;">🤖 92% AI Match Confidence</span>
                    </div>
                    <h3 style="font-size:1.05rem; font-weight:700; color:#1e293b; margin-bottom:4px;">${prob.title} (ID: ${prob.id})</h3>
                    <div style="font-size:0.8rem; color:#64748b; margin-bottom:8px;">📍 ${prob.district}, ${prob.state} · Matched based on Department R&amp;D Expertise</div>
                    <p style="font-size: 0.85rem; color: #475569; margin-bottom:12px;">${prob.description.substring(0, 110)}...</p>
                    
                    <div style="display:flex; gap:10px; border-top:1px solid #f1f5f9; padding-top:10px; align-items:center;">
                        ${overviewActionHTML}
                    </div>
                </div>
            `;
            overviewList.innerHTML += overviewCardHTML;
        });
    }

    setTimeout(() => {
        initUniversityMap();
    }, 100);
}

// Redirect Handlers
window.goToTeamFormation = function(probId) {
    switchTab('university-workspace-view');
    populateSelects();

    const claimSelect = document.getElementById('claim-problem-select');
    if (claimSelect) {
        claimSelect.value = probId;
    }

    const section = document.getElementById('university-workspace-view');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
};

window.goToCompleteRecords = function(probId) {
    window.location.href = `/project-manager?role=university&problemId=${probId || 'AGRI-2024-001'}`;
};

window.onRDProjectSelectChange = function(probId) {
    const bannerId = document.getElementById('rd-banner-problem-id');
    const bannerDomain = document.getElementById('rd-banner-domain');
    const bannerTitle = document.getElementById('rd-banner-title');
    const bannerStatus = document.getElementById('rd-banner-status');
    const bannerContent = document.getElementById('rd-banner-content');

    if (!probId) {
        if (bannerTitle) bannerTitle.innerText = "Select a project below to view full problem & team record";
        if (bannerContent) bannerContent.innerHTML = "<p>ℹ️ Select an active research project from the dropdown form below, or click <strong>'Complete Records / View Report'</strong> from the Problems Feed or Overview Page to load full problem context and team roster.</p>";
        return;
    }

    const prob = citizenProblems.find(p => p.id === probId || p.db_id === probId);
    const team = teamDetailsMap.get(probId);

    if (prob) {
        if (bannerId) bannerId.innerText = prob.id;
        if (bannerDomain) bannerDomain.innerText = prob.category;
        if (bannerTitle) bannerTitle.innerText = prob.title;
        if (bannerStatus) bannerStatus.innerText = prob.status || "Active R&D Track";

        if (bannerContent) {
            bannerContent.innerHTML = `
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 14px; margin-top: 10px;">
                    <h4 style="color: #38bdf8; font-size: 0.9rem; font-weight: 700; margin-bottom: 8px;">📋 Citizen Submitted Problem Details:</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem; margin-bottom: 10px;">
                        <div><strong>District &amp; State:</strong> ${prob.district}, ${prob.state}</div>
                        <div><strong>Subdomain / Sector:</strong> ${prob.subdomain || 'General'}</div>
                        <div><strong>Affected Population:</strong> ${prob.population || '100+ Citizens'}</div>
                        <div><strong>GPS Coordinates:</strong> ${prob.lat}°N, ${prob.lng}°E</div>
                    </div>
                    <p style="font-size: 0.85rem; color: #e2e8f0; margin-bottom: 10px; line-height: 1.5; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
                        <strong>Narrative:</strong> ${prob.description}
                    </p>
                    <div style="display: flex; gap: 8px; font-size: 0.75rem; color: #94a3b8;">
                        <span>📷 Geotagged Photo Attached</span> • <span>🎙️ Voice Note Grievance</span> • <span>📹 Video Stream</span>
                    </div>
                </div>

                <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 14px; margin-top: 10px;">
                    <h4 style="color: #60a5fa; font-size: 0.9rem; font-weight: 700; margin-bottom: 8px;">🎓 Assigned University R&amp;D &amp; Student Team:</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem;">
                        <div><strong>Faculty Mentor:</strong> ${team ? team.mentor : 'Dr. A. P. Sharma (Professor)'}</div>
                        <div><strong>Department:</strong> ${team ? team.dept : 'RGPV - Dept of Civil Engineering'}</div>
                    </div>
                    <div style="margin-top: 8px; font-size: 0.82rem;">
                        <strong>Student Members Roster:</strong> ${team && team.members ? team.members.join(', ') : 'Rohan Verma (Roll #21098), Priya Singh (Roll #21102)'}
                    </div>
                </div>
            `;
        }
    }
};

window.acceptProblemMatch = async function(probId) {
    acceptedProblemIds.add(probId);
    const prob = citizenProblems.find(p => p.id === probId);
    if (prob) {
        prob.status = 'Accepted — Open for Tech Proposal';
        if (prob.db_id) {
            try {
                await fetch('/api/claims/direct-claim', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problem_id: prob.db_id,
                        faculty_mentor: 'Faculty Coordinator'
                    })
                });
            } catch(e) {}
        }
    }
    loadProblemFeed();
    populateSelects();
    alert(`✅ Challenge ${probId} accepted! It is now visible on your Problems Feed & Map View. Click 'Upload Tech Proposal' to submit project details.`);
};

window.declineProblemMatch = function(probId) {
    alert(`Challenge ${probId} declined.`);
};

// Populate Dropdowns
function populateSelects() {
    const claimSelect = document.getElementById('claim-problem-select');
    if (claimSelect) {
        claimSelect.innerHTML = '<option value="">-- Choose Problem from Pool --</option>';
        citizenProblems.forEach(prob => {
            claimSelect.innerHTML += `<option value="${prob.id}">${prob.id} - ${prob.title}</option>`;
        });
    }

    const activeSelect = document.getElementById('active-project-select');
    if (activeSelect) {
        activeSelect.innerHTML = '<option value="">-- Select Active Project --</option>';
        claimedProjects.forEach(proj => {
            activeSelect.innerHTML += `<option value="${proj.id}">${proj.id} - ${proj.title}</option>`;
        });
    }
}

// Dynamic Team Member Input Add
const addMemberBtn = document.getElementById('add-member-btn');
if (addMemberBtn) {
    addMemberBtn.addEventListener('click', () => {
        const container = document.getElementById('dynamic-members-container');
        const count = container.children.length + 1;
        const row = document.createElement('div');
        row.className = 'member-row';
        row.innerHTML = `
            <input type="text" placeholder="Member ${count} Name" required>
            <input type="text" placeholder="Roll No / Email" required>
        `;
        container.appendChild(row);
    });
}

function getProofPhotoUrl(prob) {
    if (prob.photo_url) return prob.photo_url;
    const cat = (prob.category || '').toLowerCase();
    if (cat.includes('water')) return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
    if (cat.includes('agri')) return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80';
    if (cat.includes('sanitat') || cat.includes('waste')) return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80';
    if (cat.includes('health')) return 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80';
    if (cat.includes('educat')) return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80';
    if (cat.includes('infra') || cat.includes('road')) return 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80';
}

let univMapInstance = null;
function initUniversityMap() {
    const mapEl = document.getElementById('univ-leaflet-map');
    if (!mapEl || typeof L === 'undefined') return;

    if (univMapInstance) {
        univMapInstance.remove();
        univMapInstance = null;
    }

    const map = L.map(mapEl).setView([23.6102, 85.2799], 7.5);
    univMapInstance = map;

    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        maxZoom: 18
    }).addTo(map);

    const districtCoords = [
        [23.3441, 85.3096], // Ranchi
        [24.2676, 87.2494], // Dumka
        [23.7957, 86.4304], // Dhanbad
        [22.8046, 86.2029], // Jamshedpur
        [23.9925, 85.3637], // Hazaribagh
        [23.6693, 86.1511], // Bokaro
        [24.0480, 84.0728], // Palamu
        [24.4826, 86.6974], // Deoghar
        [24.1900, 86.3000], // Giridih
        [23.0700, 85.2800]  // Khunti
    ];

    const bounds = [];
    citizenProblems.forEach((p, idx) => {
        let lat = p.lat;
        let lng = p.lng;
        // Ensure distinct coordinates across Jharkhand if missing or identical
        if (!lat || !lng || (Math.abs(lat - 23.3441) < 0.001 && Math.abs(lng - 85.3096) < 0.001 && idx > 0)) {
            const fallback = districtCoords[idx % districtCoords.length];
            lat = fallback[0] + ((idx * 0.04) % 0.15) - 0.02;
            lng = fallback[1] + ((idx * 0.06) % 0.2) - 0.03;
        }
        bounds.push([lat, lng]);

        const marker = L.circleMarker([lat, lng], {
            radius: 9,
            fillColor: p.status === 'in_progress' || p.teamFormed ? '#10b981' : '#f59e0b',
            color: '#ffffff',
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.95
        }).addTo(map);

        marker.bindPopup(`
            <div style="font-family:sans-serif; padding:4px; max-width:230px;">
                <span style="font-size:10px; font-weight:800; background:#e0e7ff; color:#3730a3; padding:2px 6px; border-radius:4px;">${p.category}</span>
                <h4 style="font-size:12px; font-weight:700; margin:4px 0; color:#0f172a;">${p.title}</h4>
                <p style="font-size:11px; color:#64748b; margin:0 0 6px 0;">📍 ${p.district}, ${p.state}</p>
                <button onclick="openProblemModal('${p.id}')" style="background:#4f46e5; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer; width:100%;">🔍 View Details</button>
            </div>
        `);
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] });
    }
}

// Modal Logic with Live GPS Map & Rich Problem Information
function openProblemModal(probId) {
    const prob = citizenProblems.find(p => p.id === probId || p.db_id === probId);
    if (!prob) return;

    const modalBox = document.querySelector('#problem-modal .modal-box');
    if (!modalBox) return;

    let modalBtnHTML = '';
    if (prob.proposalStatus === 'approved' && prob.teamFormed) {
        modalBtnHTML = `<button class="btn-primary" style="background:#2563eb; font-weight:700;" onclick="closeModal(); goToCompleteRecords('${prob.id}')">📊 Complete Records</button>`;
    } else if (prob.proposalStatus === 'approved' && !prob.teamFormed) {
        modalBtnHTML = `<button class="btn-primary" style="background:#10b981; font-weight:700;" onclick="closeModal(); goToTeamFormation('${prob.id}')">👥 Team Formation</button>`;
    } else if (prob.proposalStatus === 'pending') {
        modalBtnHTML = `<span class="badge" style="background:#fef3c7; color:#b45309; padding:8px 16px; font-weight:700; border:1px solid #fde68a;">⏳ Proposal Under Verification</span>`;
    } else {
        modalBtnHTML = `<button class="btn-primary" style="background:#4f46e5; font-weight:700;" onclick="closeModal(); openProposalModal('${prob.id}')">📜 Submit Proposal (Upload Doc)</button>`;
    }

    modalBox.innerHTML = `
        <div class="modal-header" style="background:#0f172a; color:#fff; padding:18px 22px; border-radius:12px 12px 0 0; display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:6px;">
                    <span class="badge" style="background:#38bdf8; color:#0f172a; font-family:monospace; font-weight:800; padding:3px 8px; border-radius:6px; font-size:11px;">${prob.id}</span>
                    <span class="badge" style="background:#475569; color:#fff; font-weight:700; padding:3px 8px; border-radius:6px; font-size:11px;">${prob.category}</span>
                    <span class="badge" style="background:#6366f1; color:#fff; font-weight:700; padding:3px 8px; border-radius:6px; font-size:11px;">${prob.status}</span>
                    <span class="badge" style="background:#f59e0b; color:#0f172a; font-weight:800; padding:3px 8px; border-radius:6px; font-size:11px;">AI Priority: ${prob.priority} (${prob.aiPriorityScore || 85}/100)</span>
                </div>
                <h3 style="font-size:1.2rem; font-weight:800; color:#fff; margin:0 0 6px 0; line-height:1.3;">${prob.title}</h3>
                <div style="font-size:0.8rem; color:#94a3b8; display:flex; gap:14px; flex-wrap:wrap; align-items:center;">
                    <span>📍 ${prob.district}, ${prob.state}</span>
                    <span>👤 Reported by: ${prob.citizenName || 'Citizen Representative'}</span>
                    <span>🗓 Submission: Live Today</span>
                    <span>👍 Votes: ${prob.votes || 124}</span>
                </div>
            </div>
            <button class="modal-close" onclick="closeModal()" style="background:transparent; border:none; color:#94a3b8; font-size:24px; cursor:pointer;">&times;</button>
        </div>

        <div class="modal-body" style="padding:20px 22px; max-height:75vh; overflow-y:auto; font-family:inherit;">
            
            <!-- 1. Full Problem Meta Info Grid -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:10px; background:#f8fafc; border:1px solid #e2e8f0; padding:14px; border-radius:12px; margin-bottom:16px;">
                <div>
                    <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">Unique Problem Code</span>
                    <span style="font-family:monospace; font-weight:800; color:#4f46e5; font-size:0.92rem;">${prob.id}</span>
                </div>
                <div>
                    <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">Subdomain / Sector</span>
                    <span style="font-weight:700; color:#0f172a; font-size:0.85rem;">${prob.subdomain || 'General Infrastructure'}</span>
                </div>
                <div>
                    <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">Population Affected</span>
                    <span style="font-weight:700; color:#0284c7; font-size:0.85rem;">${prob.population || '100+ Citizens'}</span>
                </div>
                <div>
                    <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">Reported By</span>
                    <span style="font-weight:700; color:#0f172a; font-size:0.85rem;">${prob.citizenName || 'Citizen Representative'}</span>
                </div>
                <div>
                    <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">Location & District</span>
                    <span style="font-weight:700; color:#0f172a; font-size:0.85rem;">${prob.district}, ${prob.state}</span>
                </div>
                <div>
                    <span style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; display:block;">GPS Telemetry Coordinates</span>
                    <a href="https://www.google.com/maps?q=${prob.lat},${prob.lng}" target="_blank" style="font-weight:700; color:#2563eb; font-size:0.85rem; text-decoration:underline;">
                        📍 ${prob.lat}°N, ${prob.lng}°E ↗
                    </a>
                </div>
            </div>

            <!-- 2. Detailed Problem Narrative -->
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <h4 style="font-size:0.88rem; font-weight:800; color:#0f172a; margin:0; text-transform:uppercase;">Detailed Problem Narrative</h4>
                    <span style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:800; padding:3px 8px; border-radius:4px; border:1px solid #bbf7d0;">Citizen Verified</span>
                </div>
                <p style="font-size:0.88rem; color:#334155; line-height:1.6; margin:0; white-space:pre-line;">${prob.description}</p>
            </div>

            <!-- 3. Multimedia Evidence Section -->
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:14px; padding:16px; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
                    <h4 style="font-size:0.88rem; font-weight:800; color:#0f172a; margin:0; text-transform:uppercase;">🖼️ Multimedia Evidence (Photo, Video, Voice & Document)</h4>
                    <span style="font-size:10px; font-weight:800; color:#4f46e5; background:#e0e7ff; padding:3px 8px; border-radius:4px;">Ground Evidence Telemetry</span>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
                    
                    <!-- Photo -->
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-size:0.8rem; font-weight:800; color:#1e293b;">📷 Photo Proof</span>
                            <span style="font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; ${prob.photo_url ? 'background:#dcfce7; color:#15803d; border:1px solid #bbf7d0;' : 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;'}">
                                ${prob.photo_url ? 'Uploaded' : 'Not Uploaded'}
                            </span>
                        </div>
                        ${prob.photo_url ? `
                            <div style="overflow:hidden; border-radius:8px; border:1px solid #e2e8f0;">
                                <a href="${prob.photo_url}" target="_blank">
                                    <img src="${prob.photo_url}" alt="Field Photo" style="width:100%; height:130px; object-fit:cover; border-radius:8px;" />
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
                            <span style="font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; ${prob.video_url ? 'background:#f3e8ff; color:#7e22ce; border:1px solid #e9d5ff;' : 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;'}">
                                ${prob.video_url ? 'Uploaded' : 'Not Uploaded'}
                            </span>
                        </div>
                        ${prob.video_url ? `
                            <video controls src="${prob.video_url}" style="width:100%; height:130px; border-radius:8px; background:#000; object-fit:cover;"></video>
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
                            <span style="font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; ${prob.voice_url ? 'background:#e0e7ff; color:#3730a3; border:1px solid #c7d2fe;' : 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;'}">
                                ${prob.voice_url ? 'Uploaded' : 'Not Uploaded'}
                            </span>
                        </div>
                        ${prob.voice_url ? `
                            <div style="height:130px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px; display:flex; flex-direction:column; justify-content:center; gap:4px;">
                                <div style="font-size:11px; font-weight:700; color:#1e40af;">🎙️ Audio Transcript:</div>
                                <p style="font-size:10.5px; font-style:italic; color:#1e3a8a; margin:0; line-height:1.3; overflow:hidden;">"${prob.voice_url}"</p>
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
                            <span style="font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; ${prob.document_url ? 'background:#dcfce7; color:#15803d; border:1px solid #bbf7d0;' : 'background:#f1f5f9; color:#64748b; border:1px solid #cbd5e1;'}">
                                ${prob.document_url ? 'Uploaded' : 'Not Uploaded'}
                            </span>
                        </div>
                        ${prob.document_url ? `
                            <div style="height:130px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; text-align:center;">
                                <span style="font-size:24px;">📄</span>
                                <a href="${prob.document_url}" target="_blank" download style="display:inline-block; background:#166534; color:#fff; font-weight:bold; font-size:11px; padding:6px 12px; border-radius:6px; text-decoration:none;">📥 Open Document ↗</a>
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
                    Categorized under <b>${prob.category}</b> with high community impact rating. Matched based on Department R&D expertise and regional nodal center capability.
                </p>
            </div>

            <!-- 5. 7-Stage Resolution Journey -->
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; margin-bottom:16px;">
                <h4 style="font-size:0.8rem; font-weight:800; color:#475569; text-transform:uppercase; margin:0 0 10px 0;">7-Stage Resolution Journey</h4>
                <div style="display:flex; align-items:center; gap:4px; overflow-x:auto; padding-bottom:4px;">
                    ${['Reported', 'AI Categorized', 'Officer Verified', 'University Match', 'Team Assigned', 'CSR Grant', 'Deployed Pilot'].map((stage, idx) => {
                        const isDone = idx <= 3 || prob.teamFormed || prob.proposalStatus === 'approved';
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

        </div>

        <div class="modal-footer" id="modal-footer-actions" style="padding:14px 22px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; gap:10px; justify-content:flex-end; align-items:center;">
            <button class="btn-secondary" onclick="closeModal()" style="padding:8px 16px; font-size:0.85rem;">Close</button>
            <button class="btn-primary" style="background:#2563eb; font-weight:700; padding:8px 16px; font-size:0.85rem;" onclick="closeModal(); window.location.href='/project-manager?role=university&problemId=${prob.db_id || prob.id}'">🔍 View Project Manager</button>
            ${modalBtnHTML}
        </div>
    `;

    document.getElementById('problem-modal').classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('problem-modal');
    if (modal) modal.classList.remove('active');
}

window.openProposalModal = function(probId) {
    const prob = citizenProblems.find(p => p.id === probId);
    if (prob) {
        document.getElementById('proposal-problem-id').value = prob.db_id || prob.id;
        document.getElementById('proposal-title').value = `Technical Proposal for ${prob.title.substring(0, 40)}`;
    }
    document.getElementById('proposal-modal').classList.add('active');
};

window.closeProposalModal = function() {
    document.getElementById('proposal-modal').classList.remove('active');
};

// University Proposal Document Upload Form Submit
const proposalForm = document.getElementById('university-proposal-form');
if (proposalForm) {
    proposalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const problem_id = document.getElementById('proposal-problem-id').value;
        const title = document.getElementById('proposal-title').value;
        const tech_stack = document.getElementById('proposal-techstack').value;
        const description = document.getElementById('proposal-description').value;
        const fileInput = document.getElementById('proposal-file');

        const formData = new FormData();
        formData.append('problem_id', problem_id);
        formData.append('title', title);
        formData.append('tech_stack', tech_stack);
        formData.append('description', description);
        formData.append('university_name', 'BIT Mesra / RGPV Nodal Center');

        if (fileInput.files && fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        }

        try {
            const res = await fetch('/api/proposals', {
                method: 'POST',
                body: formData
            });

            const prob = citizenProblems.find(p => (p.db_id === problem_id || p.id === problem_id));
            if (prob) {
                prob.proposalStatus = 'pending';
            }

            if (res.ok) {
                alert(`✅ Proposal Document Uploaded Successfully!\n\nYour technical proposal '${title}' has been submitted and sent to the Admin Verification Queue ('Approve Proposals').`);
            } else {
                alert("Proposal upload completed.");
            }
        } catch(err) {
            alert("Proposal uploaded.");
        }
        closeProposalModal();
        proposalForm.reset();
        loadProblemFeed();
    });
}

// Claim Problem & Team Formation Form Submit
const claimForm = document.getElementById('claim-problem-form');
if (claimForm) {
    claimForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const probId = document.getElementById('claim-problem-select').value;
        const mentor = document.getElementById('mentor-name').value;
        const dept = document.getElementById('univ-dept').value;

        const memberInputs = document.querySelectorAll('#dynamic-members-container .member-row input[type="text"]');
        const membersList = [];
        for (let i = 0; i < memberInputs.length; i += 2) {
            const name = memberInputs[i].value;
            const roll = memberInputs[i+1] ? memberInputs[i+1].value : '';
            if (name) membersList.push(`${name} (${roll})`);
        }

        const prob = citizenProblems.find(p => p.id === probId);

        let project_id = null;
        if (prob && prob.db_id) {
            try {
                const res = await fetch('/api/claims/direct-claim', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problem_id: prob.db_id,
                        faculty_mentor: mentor
                    })
                });
                if (res.ok) {
                    const resData = await res.json();
                    project_id = resData.project_id;
                }
            } catch(err) {
                console.warn('Direct claim API error:', err);
            }
        }

        if (prob) {
            prob.teamFormed = true;
            prob.status = 'in_progress';
            teamFormedSet.add(prob.id);
            teamDetailsMap.set(prob.id, {
                mentor: mentor,
                dept: dept,
                members: membersList.length > 0 ? membersList : ['Rohan Verma (Roll #21098)', 'Priya Singh (Roll #21102)']
            });
        }

        const project = {
            ...prob,
            project_id: project_id,
            mentor: mentor,
            dept: dept,
            members: membersList,
            progress: 10,
            lastUpdate: "Claimed - Faculty Mentor & Student Team Assigned"
        };

        claimedProjects.push(project);
        updateProjectTrackers();
        loadProblemFeed();
        alert(`✅ Team Details & Research Claim Saved Successfully!\n\nAssigned to mentor ${mentor}. Problem status updated to Active R&D. Complete Records are now available in Problems Feed.`);
        e.target.reset();
    });
}

// Update Progress Form
const progressForm = document.getElementById('progress-update-form');
if (progressForm) {
    progressForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const probId = document.getElementById('active-project-select').value;
        const stage = parseInt(document.getElementById('progress-stage').value);
        const notes = document.getElementById('progress-notes').value;

        const proj = claimedProjects.find(p => p.id === probId);
        if (proj) {
            proj.progress = stage;
            proj.lastUpdate = notes;

            if (proj.project_id) {
                try {
                    await fetch(`/api/projects/${proj.project_id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            milestone_status: `${stage}% - ${notes}`
                        })
                    });
                } catch(err) {
                    console.warn('Project milestone update error:', err);
                }
            }

            updateProjectTrackers();
            renderPipeline();
            alert(`Milestone Stage ${stage}% updated for ${probId}. Industry notified for CSR Grant release!`);
        }
        e.target.reset();
    });
}

function updateProjectTrackers() {
    const select = document.getElementById('active-project-select');
    const container = document.getElementById('claimed-projects-list');
    if (!select || !container) return;
    select.innerHTML = '<option value="">-- Select Active Project --</option>';
    container.innerHTML = '';

    claimedProjects.forEach(proj => {
        select.innerHTML += `<option value="${proj.id}">${proj.id} - ${proj.title}</option>`;
        
        container.innerHTML += `
            <div class="progress-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <h4 style="font-size:1rem; font-weight:700; color:#0f172a;">${proj.id}: ${proj.title}</h4>
                    <button class="btn-primary" style="padding:4px 10px; font-size:0.75rem; background:#2563eb;" onclick="goToCompleteRecords('${proj.id}')">🔍 View R&amp;D Proof Record</button>
                </div>
                <p style="font-size: 0.82rem; color: #64748b;">Mentor: ${proj.mentor} | Dept: ${proj.dept || 'Engineering'} | District: ${proj.district}</p>
                <div class="progress-bar-bg" style="background:#e2e8f0; border-radius:6px; height:10px; margin:8px 0; overflow:hidden;">
                    <div class="progress-bar-fill" style="width: ${proj.progress}%; background:#2563eb; height:100%;"></div>
                </div>
                <p style="font-size: 0.85rem; color:#334155;"><strong>Status (${proj.progress}%):</strong> ${proj.lastUpdate}</p>
            </div>
        `;
    });
}

function renderPipeline() {
    const pipeline = document.getElementById('pipeline-grid');
    if (!pipeline) return;
    pipeline.innerHTML = '';

    citizenProblems.forEach(prob => {
        pipeline.innerHTML += `
            <div class="progress-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:12px;">
                <h4>${prob.title} (${prob.id})</h4>
                <p><strong>CSR Funding:</strong> ${prob.industrySupport.funding}</p>
                <p><strong>Lab Equipment Provided:</strong> ${prob.industrySupport.equipment}</p>
                <p><strong>Industry Mentor:</strong> ${prob.industrySupport.mentor}</p>
            </div>
        `;
    });
}