import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  GraduationCap,
  Users,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Upload,
  Calendar,
  MessageSquare,
  ChevronRight,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Award,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  Download,
  Share2,
  Search,
  Bell,
  ArrowLeft,
  X,
  Edit3,
  UserCheck,
  Filter,
  Check
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import MapView from './MapView';

export default function ProjectManagerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // Read problemId from URL
  const searchParams = new URLSearchParams(location.search);
  const queryProblemId = searchParams.get('problemId') || id || 'AGRI-2024-001';

  // Role is strictly determined by authenticated user JWT token, not manual URL/UI override
  const userRoleFromToken = (user?.role || 'admin').toLowerCase().trim();
  const role = ['admin', 'government', 'administrator'].includes(userRoleFromToken) 
    ? 'admin' 
    : (['university', 'academic'].includes(userRoleFromToken) ? 'university' : 'industry');

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'university' | 'industry' | 'team' | 'milestones' | 'documents' | 'funding' | 'discussion'

  // Modal states
  const [showAddUpdateModal, setShowAddUpdateModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [showEditIndustryModal, setShowEditIndustryModal] = useState(false);
  const [showEditUniversityModal, setShowEditUniversityModal] = useState(false);

  // Form states
  const [updateText, setUpdateText] = useState('');
  const [updateCategory, setUpdateCategory] = useState('Progress');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Technical Report');

  // Interactive Project State
  const [project, setProject] = useState({
    id: queryProblemId,
    title: 'Smart Irrigation System for Drought-Prone Areas',
    code: '#AGRI-2024-001',
    status: 'In Development',
    domain: 'Agriculture & Water Management',
    priority: 'High Priority',
    aiMatched: true,
    lastUpdated: '18 Sep 2026',
    progressPct: 65,
    location: 'Dumka, Jharkhand',
    coordinates: '24.2676° N, 87.2494° E',
    description:
      'Farmers in drought-prone areas face irregular water supply and lack real-time information about soil moisture, leading to low crop yield and inefficient water usage. Developing a low-cost, IoT-enabled smart irrigation system with real-time soil moisture monitoring and AI recommendation model.',
    expectedImpact: [
      'Improve crop yield by 20%',
      'Optimize water usage by 30%',
      'Support 10,000+ farmers in 5 pilot villages'
    ],
    // University Partner Details
    universityPartner: {
      name: 'Birsa Agricultural University',
      location: 'Ranchi, Jharkhand',
      lead: 'Prof. K. S. Prasad',
      mentor: 'Dr. Ananya Sharma (Dept. of Agricultural Engineering)',
      studentTeamCount: 6,
      students: [
        { name: 'Rohan Prasad', role: 'Team Lead / IoT Hardware', roll: '2021-AGRI-04' },
        { name: 'Sneha Kumari', role: 'ML & Data Analytics', roll: '2021-CSE-12' },
        { name: 'Aditya Mishra', role: 'Hardware Development', roll: '2021-ECE-09' },
        { name: 'Pooja Tiwari', role: 'Agriculture Domain Specialist', roll: '2021-AGRI-18' },
        { name: 'Vikram Kumar', role: 'Backend & App Development', roll: '2021-CSE-45' }
      ],
      contributions: [
        { label: 'Research & Development', desc: 'Soil moisture sensor calibration & crop water requirement modeling', status: 'Completed', date: '12 Jan 2025' },
        { label: 'Student Project Team', desc: '6 multidisciplinary students from Agri Engineering, CSE & ECE', status: 'Active', date: '20 Jan 2025' },
        { label: 'Faculty Mentorship', desc: 'Dr. Ananya Sharma & Prof. K. S. Prasad (Dean, Agri Engg)', status: 'Active', date: '15 Jan 2025' },
        { label: 'Lab Facilities', desc: 'IoT Lab, Soil Testing Lab & University Research Farm', status: 'Available', date: '10 Jan 2025' }
      ]
    },
    // Industry Partner Details
    industryPartner: {
      name: 'Tata Steel Foundation',
      location: 'Jamshedpur, Jharkhand',
      spoc: 'Mr. Ankit Verma',
      designation: 'Head - Sustainability & CSR',
      mentor: 'Mr. Rajiv Mehta',
      contributions: [
        { label: 'Direct CSR Funding', desc: '₹25,00,000 Committed (₹10,00,000 Disbursed for Prototype)', status: 'Disbursed', amount: '₹25,00,000' },
        { label: 'IoT Sensors & Hardware', desc: 'Soil moisture sensors, LoRaWAN gateway devices & solar panels', status: 'Delivered' },
        { label: 'Technical Mentorship', desc: 'Mr. Rajiv Mehta (Senior IoT Architect, Tata Steel Tech)', status: 'Active' },
        { label: 'Field Deployment Support', desc: 'Pilot testing across 5 adopted villages in Dumka district', status: 'In Progress' },
        { label: 'Scalability Support', desc: 'Manufacturing & distribution assistance post validation', status: 'Approved' }
      ]
    },
    // Funding Breakdown
    fundingDetails: [
      { contributor: 'Tata Steel Foundation', type: 'Direct CSR Funding', amount: '₹25,00,000', status: 'Disbursed', remarks: '₹10L released for prototype & hardware' },
      { contributor: 'Birsa Agricultural University', type: 'In-kind Support', amount: '₹5,00,000', status: 'Approved', remarks: 'Lab usage, equipment & research facilities' },
      { contributor: 'State Govt. (Proposed)', type: 'Grant (Under Review)', amount: '₹10,00,000', status: 'Under Review', remarks: 'Submitted for pilot scaling grant' }
    ],
    totalFundingCommitted: '₹30,00,000',
    // Milestones
    milestones: [
      { id: 1, title: 'Field Research & Data Collection', owner: 'Student Team', dueDate: '20 Sep 2026', submittedDate: '18 Sep 2026', status: 'Completed', approved: true },
      { id: 2, title: 'Sensor Hardware Design & Architecture', owner: 'Student Team + Mentor', dueDate: '30 Sep 2026', submittedDate: '-', status: 'In Progress', approved: false },
      { id: 3, title: 'IoT Sensor Prototype Development', owner: 'Student Team', dueDate: '20 Oct 2026', submittedDate: '-', status: 'Pending', approved: false },
      { id: 4, title: 'AI Recommendation Algorithm', owner: 'Student Team', dueDate: '10 Nov 2026', submittedDate: '-', status: 'Pending', approved: false },
      { id: 5, title: 'Field Pilot Testing in 5 Villages', owner: 'University + Industry', dueDate: '15 Dec 2026', submittedDate: '-', status: 'Pending', approved: false },
      { id: 6, title: 'Final Report & Deployment Plan', owner: 'Prof. K. S. Prasad', dueDate: '31 Mar 2027', submittedDate: '-', status: 'Pending', approved: false }
    ],
    // Documents
    documents: [
      { id: 'DOC-01', title: 'MoU - Tata Steel & Birsa Agricultural University', type: 'MoU / Agreement', uploader: 'Admin', roleTag: 'admin', date: '15 Jan 2025', size: '2.4 MB' },
      { id: 'DOC-02', title: 'Technical Solution Proposal & Architecture Blueprint', type: 'Proposal', uploader: 'University Lead', roleTag: 'university', date: '20 Jan 2025', size: '1.8 MB' },
      { id: 'DOC-03', title: 'IoT Sensor Specification & Equipment Datasheet', type: 'Technical Spec', uploader: 'Industry SPOC', roleTag: 'industry', date: '12 Feb 2025', size: '3.1 MB' },
      { id: 'DOC-04', title: 'Initial Soil Analysis & Field Survey Report - Dumka', type: 'Research Data', uploader: 'Student Team', roleTag: 'university', date: '18 Sep 2026', size: '4.5 MB' }
    ],
    // Recent Activity Timeline
    activity: [
      { id: 1, date: '18 Sep 2026', title: 'Initial Soil Analysis Data Uploaded', author: 'Rohan Prasad (Student Lead)', type: 'university' },
      { id: 2, date: '17 Sep 2026', title: 'Industry Collaboration Request Accepted by Tata Steel', author: 'Mr. Ankit Verma (Tata Steel)', type: 'industry' },
      { id: 3, date: '16 Sep 2026', title: 'Solution Proposal Approved by Admin Nodal Officer', author: 'YUKTI Admin', type: 'admin' },
      { id: 4, date: '15 Sep 2026', title: 'Faculty Mentor Assigned (Dr. Ananya Sharma)', author: 'Birsa Agricultural Univ', type: 'university' },
      { id: 5, date: '12 Sep 2026', title: 'Problem Assigned to University Nodal Center', author: 'System AI Matcher', type: 'admin' }
    ]
  });

  // Handle adding update
  const handleAddUpdate = (e) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    const newAct = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      title: `${updateCategory}: ${updateText}`,
      author: role === 'industry' ? `${project.industryPartner.spoc} (Industry)` : (role === 'university' ? `${project.universityPartner.lead} (University)` : 'YUKTI Admin'),
      type: role
    };
    setProject(prev => ({
      ...prev,
      activity: [newAct, ...prev.activity]
    }));
    setUpdateText('');
    setShowAddUpdateModal(false);
  };

  // Handle doc upload
  const handleUploadDoc = (e) => {
    e.preventDefault();
    if (!docName.trim()) return;
    const newDoc = {
      id: `DOC-${String(project.documents.length + 1).padStart(2, '0')}`,
      title: docName,
      type: docType,
      uploader: role === 'industry' ? 'Industry SPOC' : (role === 'university' ? 'University Lead' : 'Admin'),
      roleTag: role,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      size: '1.2 MB'
    };
    setProject(prev => ({
      ...prev,
      documents: [newDoc, ...prev.documents]
    }));
    setDocName('');
    setShowUploadDocModal(false);
  };

  const isEmbedded = searchParams.get('embed') === 'true' || (typeof window !== 'undefined' && window.self !== window.top);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* TOP HEADER (Hidden when embedded inside portal header) */}
      {!isEmbedded && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div 
                onClick={() => navigate('/')} 
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                  💡
                </div>
                <div>
                  <span className="font-black text-xl tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">
                    YUKTI
                  </span>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase -mt-1">
                    Project & Collaboration Manager
                  </p>
                </div>
              </div>

              {/* Back to Active Portal Button */}
              <div className="hidden sm:flex items-center ml-4 pl-4 border-l border-slate-200">
                {role === 'university' ? (
                  <button
                    onClick={() => window.location.href = '/university/university.html'}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm transition-all"
                  >
                    🎓 Back to University Portal
                  </button>
                ) : role === 'industry' ? (
                  <button
                    onClick={() => window.location.href = '/industry/industry.html'}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm transition-all"
                  >
                    🏭 Back to Industry Portal
                  </button>
                ) : (
                  <button
                    onClick={() => window.location.href = '/admin-static/admin.html'}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm transition-all"
                  >
                    🏛️ Back to Admin Portal
                  </button>
                )}
              </div>
            </div>

            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-md items-center relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Search problems, projects, universities, industries..."
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm border border-slate-200 rounded-full pl-9 pr-4 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Authenticated User Role Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                <span className="text-slate-500 font-medium mr-1.5">Authenticated Role:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] uppercase tracking-wider text-white ${
                  role === 'admin' ? 'bg-emerald-600' : role === 'university' ? 'bg-blue-600' : role === 'industry' ? 'bg-amber-600' : 'bg-slate-600'
                }`}>
                  {role}
                </span>
              </div>

              <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full relative">
                <Bell className="w-5 h-5" />
                <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5 ring-2 ring-white"></span>
              </button>

              <div className="flex items-center gap-2 pl-2">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  PS
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-none">Prathviraj Singh</p>
                  <p className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">
                    {role === 'industry' ? 'Tata Steel Partner' : (role === 'university' ? 'Birsa Univ Lead' : 'State Admin')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* MAIN CONTAINER: SIDEBAR + CONTENT */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR (No Dashboard/Explore Problems; Overview at top) */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          {/* Main Navigation Group */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Project Portal
            </div>

            {/* Overview (renamed from My Projects) */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Overview</span>
            </button>

            {/* GIS Map View */}
            <button
              onClick={() => setActiveTab('map')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'map'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4 text-cyan-600" />
              <span>GIS Map View</span>
            </button>

            {/* University Collaborations */}
            <button
              onClick={() => setActiveTab('university')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'university'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>University Collaborations</span>
            </button>

            {/* Industry Partnerships */}
            <button
              onClick={() => setActiveTab('industry')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'industry'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Industry Partnerships</span>
            </button>

            {/* Team & Mentors */}
            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'team'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Team & Mentors</span>
            </button>

            {/* Milestones & Deliverables */}
            <button
              onClick={() => setActiveTab('milestones')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'milestones'
                  ? 'bg-violet-50 text-violet-700 border border-violet-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-violet-600" />
              <span>Milestones</span>
            </button>

            {/* Documents */}
            <button
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'documents'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Documents</span>
            </button>

            {/* Funding & Impact */}
            <button
              onClick={() => setActiveTab('funding')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'funding'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Funding & Impact</span>
            </button>

            {/* Discussion */}
            <button
              onClick={() => setActiveTab('discussion')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'discussion'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-sky-600" />
              <span>Discussion & Chat</span>
            </button>
          </div>

          {/* Role Permission Badge */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              {role} Permissions
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {role === 'industry'
                ? 'You can edit Industry funding, SPOC contact, hardware contributions & upload CSR files. University & Admin records are read-only.'
                : role === 'university'
                ? 'You can edit Student team, R&D progress, faculty mentors & upload research proposals. Industry records are read-only.'
                : 'Full Administrative controls enabled across all University and Industry sections.'}
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          {activeTab === 'map' ? (
            <MapView />
          ) : (
            <>
              {/* BREADCRUMB & HERO CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
            
            {/* Breadcrumbs & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-semibold border-b border-slate-100 pb-4">
              <div className="flex items-center gap-1.5">
                <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/')}>Home</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="hover:text-slate-800 cursor-pointer">Projects</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-900 font-bold truncate max-w-xs">{project.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <button 
                  onClick={() => {
                    if (role === 'industry') setShowEditIndustryModal(true);
                    else if (role === 'university') setShowEditUniversityModal(true);
                    else alert('Admin Project Settings');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Project</span>
                </button>
              </div>
            </div>

            {/* Project Header Info & Hero Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              <div className="lg:col-span-2 space-y-4">
                {/* Title & Badges */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-extrabold tracking-wide">
                      {project.code}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {project.status}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-extrabold">
                      {project.domain}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 text-xs font-extrabold">
                      {project.priority}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 text-xs font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Matched
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                    {project.title}
                  </h1>

                  <p className="text-xs text-slate-500 font-medium flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {project.location}</span>
                    <span>•</span>
                    <span>Last updated: {project.lastUpdated}</span>
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed font-normal bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {project.description}
                </p>

                {/* Expected Impact Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="text-xs font-bold text-slate-700">Expected Impact:</span>
                  {project.expectedImpact.map((imp, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {imp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Banner Image & Progress Circle */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between h-full min-h-[220px]">
                <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl"></div>

                <div className="flex items-center justify-between z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Project Progress
                  </span>
                  <span className="text-xs font-bold bg-white/10 px-2.5 py-1 rounded-full text-slate-200">
                    Phase 3 / 7
                  </span>
                </div>

                <div className="flex items-center justify-between z-10 my-4">
                  <div>
                    <p className="text-4xl font-black text-white tracking-tight">{project.progressPct}%</p>
                    <p className="text-xs text-slate-300 font-medium mt-1">Research & Design in progress</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-emerald-200 flex items-center justify-center font-black text-sm bg-slate-800/80">
                    {project.progressPct}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden z-10">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${project.progressPct}%` }}></div>
                </div>
              </div>
            </div>

            {/* TOP NAVIGATION TABS (Overview, University, Industry, etc.) */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-px text-sm font-bold scrollbar-none">
              {[
                { id: 'overview', label: 'Overview', icon: Layers },
                { id: 'university', label: 'University Collaboration', icon: GraduationCap },
                { id: 'industry', label: 'Industry Partnership', icon: Building2 },
                { id: 'team', label: 'Team & Mentors', icon: Users },
                { id: 'milestones', label: 'Milestones', icon: CheckCircle2 },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'funding', label: 'Funding & Impact', icon: TrendingUp },
                { id: 'discussion', label: 'Discussion', icon: MessageSquare },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: OVERVIEW PAGE VIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Partner Cards Grid (University & Industry Side-by-Side as in Image 1) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* UNIVERSITY PARTNER CARD */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shadow-xs">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            University Partner
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-base mt-1">
                            {project.universityPartner.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {project.universityPartner.location}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('university')}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all"
                      >
                        View Profile
                      </button>
                    </div>

                    <div className="h-px bg-slate-100 my-2"></div>

                    {/* University Contributions List */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contributions:</p>
                      {project.universityPartner.contributions.map((c, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800">{c.label}: </span>
                            <span>{c.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100">
                    <span>Lead: {project.universityPartner.lead}</span>
                    <button 
                      onClick={() => alert(`Contacting ${project.universityPartner.mentor}`)}
                      className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                    >
                      Contact Mentor
                    </button>
                  </div>
                </div>

                {/* INDUSTRY PARTNER CARD */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-200 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100 shadow-xs">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                            Industry Partner
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-base mt-1">
                            {project.industryPartner.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {project.industryPartner.location}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('industry')}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-all"
                      >
                        View Profile
                      </button>
                    </div>

                    <div className="h-px bg-slate-100 my-2"></div>

                    {/* Industry Contributions List */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contributions:</p>
                      {project.industryPartner.contributions.map((c, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800">{c.label}: </span>
                            <span>{c.desc}</span>
                            {c.amount && <span className="font-extrabold text-emerald-600 ml-1">({c.amount})</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100">
                    <span>SPOC: {project.industryPartner.spoc}</span>
                    <button 
                      onClick={() => alert(`Contacting ${project.industryPartner.spoc}`)}
                      className="px-3 py-1 rounded-md bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition-colors"
                    >
                      Contact Industry SPOC
                    </button>
                  </div>
                </div>
              </div>

              {/* LOWER SECTION: FUNDING DETAILS TABLE + RIGHT PANEL PROGRESS & QUICK ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT 2 COLS: FUNDING DETAILS TABLE */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        ₹
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base">Funding & Financial Details</h3>
                        <p className="text-xs text-slate-500 font-medium">CSR grants, university contributions & state funds</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Committed</p>
                      <p className="text-lg font-black text-emerald-600">{project.totalFundingCommitted}</p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-y border-slate-200">
                        <tr>
                          <th className="py-3 px-3">Contributor</th>
                          <th className="py-3 px-3">Type</th>
                          <th className="py-3 px-3">Amount (INR)</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {project.fundingDetails.map((f, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-900">{f.contributor}</td>
                            <td className="py-3 px-3 text-slate-600">{f.type}</td>
                            <td className="py-3 px-3 font-extrabold text-emerald-700">{f.amount}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                f.status === 'Disbursed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : f.status === 'Approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {f.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 text-[11px]">{f.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RIGHT COL: PROJECT PROGRESS STEPPER & QUICK ACTIONS */}
                <div className="space-y-6">
                  
                  {/* Stepper Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="font-black text-slate-900 text-sm">Project Lifecycle Progress</h4>
                      <span className="text-xs font-bold text-emerald-600">65% Done</span>
                    </div>

                    <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 text-xs">
                      {[
                        { title: 'Problem Identified', date: '12 Jan 2025', done: true },
                        { title: 'University Assigned', date: '20 Jan 2025', done: true },
                        { title: 'Industry Partnered', date: '15 Feb 2025', done: true },
                        { title: 'Research & Design', date: 'In Progress', active: true },
                        { title: 'Prototype Development', date: 'Pending', pending: true },
                        { title: 'Field Testing', date: 'Pending', pending: true },
                        { title: 'Deployment', date: 'Pending', pending: true },
                      ].map((step, i) => (
                        <div key={i} className="relative group">
                          <div className={`absolute -left-[21px] top-0.5 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                            step.done
                              ? 'border-emerald-600 bg-emerald-600'
                              : step.active
                              ? 'border-blue-600 bg-blue-600 animate-pulse'
                              : 'border-slate-300'
                          }`}></div>
                          <div className="flex items-center justify-between">
                            <span className={`font-bold ${step.done ? 'text-slate-900' : (step.active ? 'text-blue-700' : 'text-slate-400')}`}>
                              {step.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{step.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <h4 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">
                      Quick Actions
                    </h4>

                    <div className="grid grid-cols-1 gap-2 text-xs font-bold">
                      <button
                        onClick={() => setShowAddUpdateModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>Add Project Update</span>
                      </button>

                      <button
                        onClick={() => setShowUploadDocModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Upload Document</span>
                      </button>

                      <button
                        onClick={() => alert('Support Request submitted to State Admin Nodal Officer.')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Request Support</span>
                      </button>

                      <button
                        onClick={() => alert('Meeting scheduler opened.')}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-violet-600" />
                        <span>Schedule Meeting</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UNIVERSITY COLLABORATION TAB (Matches Image 2 left & Image 3) */}
          {activeTab === 'university' && (
            <div className="space-y-6">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-blue-300" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                      University Contribution Portal
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{project.universityPartner.name}</h2>
                  <p className="text-xs text-blue-200 font-medium">
                    Faculty Lead: {project.universityPartner.lead} | Mentor: {project.universityPartner.mentor}
                  </p>
                </div>

                {role === 'university' && (
                  <button 
                    onClick={() => setShowEditUniversityModal(true)}
                    className="px-4 py-2 rounded-xl bg-white text-blue-900 font-extrabold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center gap-2 shrink-0"
                  >
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    <span>Update University Progress</span>
                  </button>
                )}
              </div>

              {/* R&D Progress & Student Team Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Contributions & Team Roster */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Research & Analysis Grid */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-600" />
                      Our Research & R&D Deliverables
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {project.universityPartner.contributions.map((c, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{c.label}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                              {c.status}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs">{c.desc}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Logged: {c.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Team Roster */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        Assigned Student Project Team ({project.universityPartner.studentTeamCount} Members)
                      </h3>
                      {role === 'university' && (
                        <button 
                          onClick={() => alert('Add Student Member modal')}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          + Add Member
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.universityPartner.students.map((st, i) => (
                        <div key={i} className="p-3 rounded-xl border border-slate-200 flex items-center gap-3 bg-white hover:bg-slate-50 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {st.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div className="min-w-0 flex-1 text-xs">
                            <p className="font-bold text-slate-900 truncate">{st.name}</p>
                            <p className="text-slate-500 font-medium text-[11px] truncate">{st.role}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{st.roll}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Col: Timeline & University Notes */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h4 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">
                      University R&D Timeline
                    </h4>

                    <div className="space-y-3 text-xs">
                      {[
                        { title: 'Problem Assigned to University', date: '12 Jan 2025', status: 'Completed' },
                        { title: 'Initial Review & Scope Finalized', date: '14 Jan 2025', status: 'Completed' },
                        { title: 'Student Team Formed', date: '20 Jan 2025', status: 'Completed' },
                        { title: 'Soil Calibration & Research', date: 'In Progress', status: 'Active' },
                        { title: 'Prototype Sensor Build', date: 'Pending', status: 'Pending' },
                        { title: 'Field Testing Report', date: 'Pending', status: 'Pending' },
                      ].map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                          <span className="font-bold text-slate-800">{t.title}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            t.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'Active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INDUSTRY PARTNERSHIP TAB (Matches Image 2 right) */}
          {activeTab === 'industry' && (
            <div className="space-y-6">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-yellow-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-amber-300" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                      Industry Partnership & CSR Portal
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{project.industryPartner.name}</h2>
                  <p className="text-xs text-amber-200 font-medium">
                    SPOC: {project.industryPartner.spoc} ({project.industryPartner.designation})
                  </p>
                </div>

                {role === 'industry' && (
                  <button 
                    onClick={() => setShowEditIndustryModal(true)}
                    className="px-4 py-2 rounded-xl bg-white text-amber-900 font-extrabold text-xs shadow-md hover:bg-amber-50 transition-all flex items-center gap-2 shrink-0"
                  >
                    <Edit3 className="w-4 h-4 text-amber-600" />
                    <span>Edit Industry Support</span>
                  </button>
                )}
              </div>

              {/* Industry Metrics & Contributions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Industry Support Details */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Support Breakdown */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-amber-600" />
                      Our Support & Contributions to this Project
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {project.industryPartner.contributions.map((c, i) => (
                        <div key={i} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{c.label}</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                              {c.status}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs">{c.desc}</p>
                          {c.amount && (
                            <p className="text-sm font-black text-emerald-600 mt-1">Committed: {c.amount}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Impact & SDG Alignment */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      CSR Impact Targets & UN SDG Alignment
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-center">
                      <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <p className="text-2xl font-black">20%</p>
                        <p className="text-[11px] mt-1">Crop Yield Boost</p>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                        <p className="text-2xl font-black">30%</p>
                        <p className="text-[11px] mt-1">Water Saved</p>
                      </div>
                      <div className="p-4 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
                        <p className="text-2xl font-black">10,000+</p>
                        <p className="text-[11px] mt-1">Farmers Impacted</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: SPOC & CSR Certificate Quick Action */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <h4 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">
                      Industry SPOC & Mentor
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <p className="font-bold text-slate-900">{project.industryPartner.spoc}</p>
                        <p className="text-slate-500">{project.industryPartner.designation}</p>
                        <p className="text-[10px] text-amber-700 font-bold">{project.industryPartner.name}</p>
                      </div>

                      <button 
                        onClick={() => alert('Downloading official YUKTI CSR Compliance Certificate (Section 135 compliant)')}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Download CSR Certificate</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEAM & MENTORS TAB */}
          {activeTab === 'team' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Project Team & Mentors Roster</h3>
                  <p className="text-xs text-slate-500 font-medium">Faculty mentors, industry experts & student developers</p>
                </div>
              </div>

              {/* Mentors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    Faculty Lead Mentor
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{project.universityPartner.mentor}</h4>
                  <p className="text-xs text-slate-600">Birsa Agricultural University</p>
                  <button className="text-xs font-bold text-blue-600 mt-2 hover:underline">Contact Mentor</button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    Industry Technical SPOC
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{project.industryPartner.spoc}</h4>
                  <p className="text-xs text-slate-600">{project.industryPartner.designation} (Tata Steel)</p>
                  <button className="text-xs font-bold text-amber-700 mt-2 hover:underline">Contact SPOC</button>
                </div>
              </div>

              {/* Student Team List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Student Developer Team</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {project.universityPartner.students.map((st, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
                      <p className="font-bold text-slate-900">{st.name}</p>
                      <p className="text-slate-500 text-[11px]">{st.role}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{st.roll}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MILESTONES TAB */}
          {activeTab === 'milestones' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Project Milestones & Deliverables</h3>
                  <p className="text-xs text-slate-500 font-medium">Track progress across R&D stages</p>
                </div>
                {role === 'university' && (
                  <button 
                    onClick={() => alert('Submit Deliverable Modal')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all"
                  >
                    + Submit Deliverable
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-3">Milestone Title</th>
                      <th className="py-3 px-3">Owner</th>
                      <th className="py-3 px-3">Due Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {project.milestones.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-400">{m.id}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{m.title}</td>
                        <td className="py-3 px-3 text-slate-600">{m.owner}</td>
                        <td className="py-3 px-3 text-slate-500">{m.dueDate}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            m.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {m.approved ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Project Document Repository</h3>
                  <p className="text-xs text-slate-500 font-medium">All uploaded agreements, proposals, specs & research files</p>
                </div>
                <button
                  onClick={() => setShowUploadDocModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.documents.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0 border border-teal-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          doc.roleTag === 'industry'
                            ? 'bg-amber-100 text-amber-800'
                            : doc.roleTag === 'university'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {doc.uploader}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">{doc.title}</h4>
                        <p className="text-slate-500 text-[11px]">{doc.type} • {doc.size} • Uploaded {doc.date}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert(`Downloading ${doc.title}`)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: FUNDING & IMPACT TAB */}
          {activeTab === 'funding' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="font-black text-slate-900 text-lg">Financial Breakdown & Committed Capital</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <p className="text-xs font-bold uppercase text-emerald-600">Total Committed</p>
                    <p className="text-3xl font-black mt-1">₹30,00,000</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                    <p className="text-xs font-bold uppercase text-blue-600">Disbursed Funds</p>
                    <p className="text-3xl font-black mt-1">₹10,00,000</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <p className="text-xs font-bold uppercase text-amber-600">Remaining Balance</p>
                    <p className="text-3xl font-black mt-1">₹20,00,000</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DISCUSSION TAB */}
          {activeTab === 'discussion' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-lg">Project Discussion Thread</h3>
                <p className="text-xs text-slate-500 font-medium">Real-time collaboration between University, Industry & Admin</p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {project.activity.map((act) => (
                  <div key={act.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{act.author}</span>
                      <span className="text-[10px] text-slate-400">{act.date}</span>
                    </div>
                    <p className="text-slate-700">{act.title}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Write a message or update..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800">
                  Send
                </button>
              </div>
            </div>
          )}
            </>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD UPDATE */}
      {showAddUpdateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Add Project Update</h3>
              <button onClick={() => setShowAddUpdateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={updateCategory}
                  onChange={e => setUpdateCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="Progress">Progress Update</option>
                  <option value="Research">Research Finding</option>
                  <option value="Hardware">Hardware / Equipment</option>
                  <option value="Field Visit">Field Visit & Survey</option>
                  <option value="Funding">Funding Disbursement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Update Details</label>
                <textarea
                  rows={3}
                  value={updateText}
                  onChange={e => setUpdateText(e.target.value)}
                  placeholder="Describe the update or accomplishment..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUpdateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Post Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD DOCUMENT */}
      {showUploadDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Upload Document</h3>
              <button onClick={() => setShowUploadDocModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  placeholder="e.g. Field Soil Test Report.pdf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="Technical Report">Technical Report</option>
                  <option value="MoU / Agreement">MoU / Agreement</option>
                  <option value="Proposal">Technical Proposal</option>
                  <option value="Research Data">Research Data / Dataset</option>
                  <option value="Financial Document">Financial / CSR Receipt</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Choose File</label>
                <input
                  type="file"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT INDUSTRY SUPPORT */}
      {showEditIndustryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Edit Industry Support (Tata Steel)</h3>
              <button onClick={() => setShowEditIndustryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Committed CSR Funding (INR)</label>
                <input
                  type="text"
                  defaultValue={project.industryPartner.contributions[0].amount}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Industry SPOC Name</label>
                <input
                  type="text"
                  defaultValue={project.industryPartner.spoc}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hardware / Equipment Provided</label>
                <textarea
                  rows={2}
                  defaultValue={project.industryPartner.contributions[1].desc}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditIndustryModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Industry support details updated!');
                    setShowEditIndustryModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT UNIVERSITY PROGRESS */}
      {showEditUniversityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Update University R&D Progress</h3>
              <button onClick={() => setShowEditUniversityModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Overall R&D Progress (%)</label>
                <input
                  type="number"
                  defaultValue={project.progressPct}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty Lead / Mentor</label>
                <input
                  type="text"
                  defaultValue={project.universityPartner.lead}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Latest R&D Status Summary</label>
                <textarea
                  rows={2}
                  defaultValue={project.universityPartner.contributions[0].desc}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditUniversityModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('University progress updated!');
                    setShowEditUniversityModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Save Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
