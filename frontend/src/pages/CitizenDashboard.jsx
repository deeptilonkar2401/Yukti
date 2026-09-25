import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, ChevronUp, MapPin, Users, Brain, MessageSquare,
    ThumbsUp, Clock, CheckCircle, AlertTriangle, Flame, Send,
    X, Eye, Filter, Search, PlusCircle, ChevronDown, Star, Bell,
    Sparkles, ShieldCheck, Camera, Mic, Video, FileText, Share2, Layers,
    TrendingUp, Award, Activity, Compass, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useProblems } from '../context/ProblemContext';

/* ──────────────────────────────────────────────
   PRIORITY & STATUS BADGE COLOR SCHEMES
────────────────────────────────────────────── */
const prioBadgeStyle = (level) => {
    switch (level) {
        case 'Critical':
            return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
        case 'High':
            return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
        case 'Medium':
            return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
        default:
            return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    }
};

const statusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('resolved') || s.includes('completed')) {
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    } else if (s.includes('progress') || s.includes('active')) {
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    } else if (s.includes('matched') || s.includes('university')) {
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    } else if (s.includes('review') || s.includes('pending')) {
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    } else {
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
};

const INDIA_STATES_DISTRICTS = {
    'All States': ['All Districts'],
    'Jharkhand': ['All Districts', 'Ranchi', 'Jamshedpur', 'Dhanbad', 'Dumka', 'Palamu', 'Giridih', 'Hazaribagh', 'Bokaro', 'Deoghar', 'Khunti', 'Latehar', 'Simdega', 'Gumla', 'Lohardaga', 'East Singhbhum', 'West Singhbhum', 'Saraikela', 'Ramgarh', 'Chatra', 'Koderma', 'Jamtara', 'Pakur', 'Sahebganj', 'Godda'],
    'Bihar': ['All Districts', 'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Begusarai'],
    'West Bengal': ['All Districts', 'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Kharagpur'],
    'Odisha': ['All Districts', 'Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Berhampur'],
    'Uttar Pradesh': ['All Districts', 'Lucknow', 'Kanpur', 'Varanasi', 'Noida', 'Agra', 'Prayagraj', 'Gorakhpur'],
    'Maharashtra': ['All Districts', 'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad'],
    'Delhi': ['All Districts', 'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'South Delhi']
};

export default function CitizenDashboard() {
    const navigate = useNavigate();
    const { problems, myProblems, handleVote } = useProblems();
    const [votedIds, setVotedIds] = useState(new Set());
    const [expandedId, setExpandedId] = useState(null);
    const [feedbackOpen, setFeedbackOpen] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(new Set());
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedState, setSelectedState] = useState('All States');
    const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
    const [viewTab, setViewTab] = useState('feed'); // 'feed' | 'my_problems'
    const [searchQuery, setSearchQuery] = useState('');
    const [trackingOpen, setTrackingOpen] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [clarificationResponses, setClarificationResponses] = useState({});
    const [lightboxMedia, setLightboxMedia] = useState(null);

    const onVoteClick = (id) => {
        if (votedIds.has(id)) return;
        handleVote(id);
        setVotedIds(prev => new Set([...prev, id]));
    };

    const handleFeedbackSubmit = (id) => {
        if (!feedbackText.trim()) return;
        setFeedbackSubmitted(prev => new Set([...prev, id]));
        setFeedbackText('');
        setFeedbackOpen(null);
    };

    const handleClarificationSubmit = (probId) => {
        const text = clarificationResponses[probId];
        if (!text || !text.trim()) return;
        alert("Response submitted! Admin and assigned university team have been notified.");
        setClarificationResponses(prev => ({ ...prev, [probId]: '' }));
    };

    const filteredProblems = problems
        .filter(p => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'trending') return p.votes >= 100;
            return p.status.toLowerCase().includes(activeFilter);
        })
        .filter(p => {
            if (selectedState === 'All States') return true;
            return p.location.toLowerCase().includes(selectedState.toLowerCase());
        })
        .filter(p => {
            if (selectedDistrict === 'All Districts') return true;
            return p.location.toLowerCase().includes(selectedDistrict.toLowerCase());
        })
        .filter(p =>
            searchQuery === '' ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.domain.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const bTime = b.timestamp || 0;
            const aTime = a.timestamp || 0;
            if (bTime !== aTime) return bTime - aTime;
            return b.votes - a.votes;
        });

    const stats = {
        total: problems.length,
        underReview: problems.filter(p => p.status === 'Under Review' || p.status === 'Submitted').length,
        matched: problems.filter(p => p.status === 'University Matched').length,
        inProgress: problems.filter(p => p.status === 'In Progress' || p.status === 'Resolved').length,
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
            {/* Ambient Background Blur Elements */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

                {/* HERO BANNER */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                                <span>SIH26043 Community Innovation Ecosystem</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                Citizen Problem <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">Command Centre</span>
                            </h1>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                Report societal issues, upvote priority challenges, and track real-time solution development from Nodal Officer approval to University R&D and Industry CSR funding.
                            </p>
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 p-3 rounded-xl transition-all shadow-lg flex items-center justify-center"
                                    title="Notifications"
                                >
                                    <Bell className="h-5 w-5 text-indigo-400" />
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce">
                                        2
                                    </span>
                                </button>

                                {/* Notification Dropdown Modal */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 space-y-3 text-xs">
                                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                            <h4 className="font-bold text-white flex items-center gap-1.5">
                                                <Bell className="h-4 w-4 text-indigo-400" /> Live Updates
                                            </h4>
                                            <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200">
                                                <div className="font-semibold text-white">🎓 Matched to University</div>
                                                <p className="mt-0.5 text-slate-300">Your reported problem "Borewell Contamination in Palamu" was assigned to BIT Mesra R&D team.</p>
                                                <span className="text-[10px] text-indigo-400 font-mono mt-1 block">10 mins ago</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-200">
                                                <div className="font-semibold text-white">⚠️ Action Required</div>
                                                <p className="mt-0.5 text-slate-300">Nodal Officer requested GPS photo proof for "Stubble Burning in Dumka".</p>
                                                <span className="text-[10px] text-amber-400 font-mono mt-1 block">1 hour ago</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link
                                to="/map"
                                className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold px-4 py-3 rounded-xl border border-slate-700 flex items-center gap-2 text-xs sm:text-sm transition-all shadow-lg hover:border-cyan-500/50"
                            >
                                <MapPin className="h-4 w-4 text-cyan-400" /> GIS Map View
                            </Link>

                            <Link
                                to="/submit"
                                className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 text-xs sm:text-sm transition-all shadow-xl hover:shadow-indigo-500/25 hover:scale-105 active:scale-95"
                            >
                                <PlusCircle className="h-4 w-4" /> Submit Problem
                            </Link>
                        </div>
                    </div>
                </div>

                {/* STATS ANALYTICS METRICS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-all shadow-lg group">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Reported</span>
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                                <Activity className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{stats.total}</span>
                            <span className="text-xs text-indigo-400 font-medium">Statewide</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all shadow-lg group">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Under Review</span>
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-all">
                                <Clock className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-amber-400">{stats.underReview}</span>
                            <span className="text-xs text-amber-500/80 font-medium">Pending Officer</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 transition-all shadow-lg group">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">University Matched</span>
                            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-all">
                                <Brain className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-cyan-400">{stats.matched}</span>
                            <span className="text-xs text-cyan-500/80 font-medium">Active R&D Tracks</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition-all shadow-lg group">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">CSR Pilots Live</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-emerald-400">{stats.inProgress}</span>
                            <span className="text-xs text-emerald-500/80 font-medium">Deployed Solutions</span>
                        </div>
                    </div>
                </div>

                {/* VIEW TAB SWITCHER */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-md">
                    <button
                        onClick={() => setViewTab('feed')}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            viewTab === 'feed'
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                    >
                        <Compass className="h-4 w-4" /> Community Problem Feed
                    </button>
                    <button
                        onClick={() => setViewTab('my_problems')}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            viewTab === 'my_problems'
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                    >
                        <Star className="h-4 w-4 text-amber-400" /> My Submissions ({myProblems.length})
                    </button>
                </div>

                {/* TAB VIEW 1: MY SUBMITTED PROBLEMS TRACKER */}
                {viewTab === 'my_problems' && (
                    <div className="space-y-6">
                        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                                <div>
                                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                                        <Star className="h-5 w-5 text-amber-400" /> My Submitted Problems & End-to-End Tracking
                                    </h2>
                                    <p className="text-slate-400 text-xs mt-1">
                                        Track the step-by-step progress of your reported societal problems from Nodal Officer verification to University match and CSR grant funding.
                                    </p>
                                </div>
                                <Link
                                    to="/submit"
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg w-fit"
                                >
                                    <PlusCircle className="h-4 w-4" /> Report Another Problem
                                </Link>
                            </div>

                            {myProblems.length === 0 ? (
                                <div className="text-center py-16 bg-slate-950/60 rounded-2xl border border-slate-800 p-8 space-y-3">
                                    <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
                                    <h3 className="text-base font-bold text-white">No Submitted Problems Found</h3>
                                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                                        You haven't submitted any problems yet. Report an issue in your locality to start tracking its resolution lifecycle.
                                    </p>
                                    <Link
                                        to="/submit"
                                        className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition mt-2"
                                    >
                                        Submit First Problem <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            ) : (
                                myProblems.map(myP => (
                                    <div key={myP.id} className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 space-y-5 transition-all shadow-xl">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                                                        {myP.id}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusBadgeStyle(myP.status)}`}>
                                                        {myP.status}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${prioBadgeStyle(myP.aiPriority?.level)}`}>
                                                        Priority: {myP.aiPriority?.level || 'Medium'} ({myP.aiPriority?.score || 85}/100)
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-white">{myP.title}</h3>
                                                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                                                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-cyan-400" /> {myP.location}</span>
                                                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-500" /> {myP.submittedOn}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setTrackingOpen(trackingOpen === myP.id ? null : myP.id)}
                                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md self-start"
                                            >
                                                <Eye className="h-4 w-4 text-indigo-400" /> {trackingOpen === myP.id ? 'Hide Details' : 'View Full Details'}
                                            </button>
                                        </div>

                                        {/* Clarification Request Banner */}
                                        {myP.clarification_requested && (
                                            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl space-y-3">
                                                <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold">
                                                    <AlertTriangle className="h-4 w-4 text-amber-400" /> Action Needed: Nodal Officer Clarification Request
                                                </div>
                                                <p className="text-slate-300 text-xs bg-amber-900/20 p-3 rounded-xl border border-amber-500/20">
                                                    "{myP.clarification_prompt || 'Please confirm if water sample test reports or field photos are available.'}"
                                                </p>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Provide clarification response..."
                                                        value={clarificationResponses[myP.id] || ''}
                                                        onChange={(e) => setClarificationResponses({ ...clarificationResponses, [myP.id]: e.target.value })}
                                                        className="flex-1 bg-slate-900 border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                                                    />
                                                    <button
                                                        onClick={() => handleClarificationSubmit(myP.id)}
                                                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg"
                                                    >
                                                        Submit Response
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Expandable Details */}
                                        {trackingOpen === myP.id && (
                                            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs text-slate-300">
                                                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Full Problem Statement</h4>
                                                <p className="leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">{myP.description}</p>
                                                <div className="flex items-center gap-2 text-indigo-400 font-semibold pt-1">
                                                    <Brain className="h-4 w-4" /> AI Match Rationale: Matched with high priority due to public health impact and regional proximity.
                                                </div>
                                            </div>
                                        )}

                                        {/* 7-STAGE LIFECYCLE ROADMAP */}
                                        <div className="pt-2 border-t border-slate-800/80">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <Layers className="h-3.5 w-3.5 text-indigo-400" /> SIH26043 Problem-to-Solution Journey Track
                                            </h4>
                                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                                {(myP.timeline || [
                                                    { stage: 'Reported', done: true, date: myP.submittedOn },
                                                    { stage: 'AI Categorized', done: true, date: 'Auto' },
                                                    { stage: 'Officer Verified', done: myP.status !== 'Under Review', date: 'Verified' },
                                                    { stage: 'University Matched', done: myP.status === 'University Matched' || myP.status === 'In Progress' || myP.status === 'Resolved', date: 'BIT Mesra' },
                                                    { stage: 'Team Assigned', done: myP.status === 'In Progress' || myP.status === 'Resolved', date: 'Faculty Mentor' },
                                                    { stage: 'CSR Co-Funded', done: myP.status === 'In Progress' || myP.status === 'Resolved', date: 'Tata CSR' },
                                                    { stage: 'Field Deployed', done: myP.status === 'Resolved', date: 'Pilot Live' },
                                                ]).map((step, i, arr) => (
                                                    <React.Fragment key={i}>
                                                        <div className="flex flex-col items-center min-w-[105px]">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                                step.done
                                                                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                                                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                                            }`}>
                                                                {step.done ? <CheckCircle className="h-4 w-4" /> : i + 1}
                                                            </div>
                                                            <span className={`text-[10px] font-bold mt-1.5 text-center leading-tight ${
                                                                step.done ? 'text-emerald-400' : 'text-slate-500'
                                                            }`}>
                                                                {step.stage}
                                                            </span>
                                                            <span className="text-[9px] text-slate-500 mt-0.5">{step.date}</span>
                                                        </div>
                                                        {i < arr.length - 1 && (
                                                            <div className={`h-0.5 w-6 flex-shrink-0 ${step.done ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* TAB VIEW 2: COMMUNITY PROBLEMS FEED */}
                {viewTab === 'feed' && (
                    <div className="space-y-6">

                        {/* SEARCH & FILTERS CONTROLS */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
                            <div className="flex flex-col lg:flex-row gap-3">
                                {/* Search input */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search by problem title, district, or domain..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 pl-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                                    />
                                    <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white">
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {/* State & District Location Selectors */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={selectedState}
                                        onChange={(e) => {
                                            setSelectedState(e.target.value);
                                            setSelectedDistrict('All Districts');
                                        }}
                                        className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3.5 py-3 focus:border-indigo-500 outline-none transition cursor-pointer"
                                    >
                                        {Object.keys(INDIA_STATES_DISTRICTS).map((st) => (
                                            <option key={st} value={st} className="bg-slate-900 text-slate-200">
                                                🗺️ {st}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3.5 py-3 focus:border-indigo-500 outline-none transition cursor-pointer"
                                    >
                                        {(INDIA_STATES_DISTRICTS[selectedState] || ['All Districts']).map((dist) => (
                                            <option key={dist} value={dist} className="bg-slate-900 text-slate-200">
                                                📍 {dist}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Filter Chips */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-800/80 pt-3">
                                <Filter className="h-4 w-4 text-slate-400 ml-1 flex-shrink-0" />
                                {[
                                    { key: 'all', label: 'All Problems' },
                                    { key: 'trending', label: '🔥 Trending / Hot' },
                                    { key: 'review', label: 'Awaiting Officer' },
                                    { key: 'matched', label: '🎓 University Matched' },
                                    { key: 'progress', label: '🚀 CSR Pilots Live' },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveFilter(tab.key)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                                            activeFilter === tab.key
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                                                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PROBLEM CARDS FEED */}
                        <div className="space-y-4">
                            {filteredProblems.length === 0 ? (
                                <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-3">
                                    <Search className="h-10 w-10 text-slate-600 mx-auto" />
                                    <h3 className="text-base font-bold text-slate-300">No Problems Match Your Criteria</h3>
                                    <p className="text-xs text-slate-500">Try adjusting your search keywords, district filters, or category tabs.</p>
                                </div>
                            ) : (
                                filteredProblems.map(prob => (
                                    <div
                                        key={prob.id}
                                        className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-3xl transition-all duration-300 shadow-xl overflow-hidden group"
                                    >
                                        <div className="flex flex-col sm:flex-row">

                                            {/* UPVOTE COLUMN */}
                                            <div className="flex sm:flex-col items-center justify-between sm:justify-center p-4 bg-slate-950/60 border-b sm:border-b-0 sm:border-r border-slate-800/80 min-w-[80px]">
                                                <button
                                                    onClick={() => onVoteClick(prob.id)}
                                                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                                                        votedIds.has(prob.id)
                                                            ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400'
                                                    }`}
                                                    title="Upvote community problem"
                                                >
                                                    <ChevronUp className="h-6 w-6" />
                                                </button>
                                                <div className="flex sm:flex-col items-center gap-1 sm:gap-0 mt-1">
                                                    <span className={`text-base font-extrabold ${votedIds.has(prob.id) ? 'text-indigo-400' : 'text-white'}`}>
                                                        {prob.votes}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Votes</span>
                                                </div>

                                                {prob.votes >= 100 && (
                                                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full mt-2">
                                                        <Flame className="h-3 w-3" /> Hot
                                                    </span>
                                                )}
                                            </div>

                                            {/* CARD MAIN BODY */}
                                            <div className="flex-1 p-5 space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                                                {prob.id}
                                                            </span>
                                                            <span className="bg-indigo-500/10 text-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                                                                {prob.domain}
                                                            </span>
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusBadgeStyle(prob.status)}`}>
                                                                {prob.status}
                                                            </span>
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${prioBadgeStyle(prob.aiPriority?.level)}`}>
                                                                AI: {prob.aiPriority?.level || 'Medium'} ({prob.aiPriority?.score || 85}/100)
                                                            </span>
                                                        </div>

                                                        <h3
                                                            onClick={() => setExpandedId(expandedId === prob.id ? null : prob.id)}
                                                            className="text-base sm:text-lg font-bold text-white hover:text-indigo-400 transition cursor-pointer"
                                                        >
                                                            {prob.title}
                                                        </h3>
                                                    </div>

                                                    <div className="flex items-center gap-2 self-start sm:self-center">
                                                        <button
                                                            onClick={() => setFeedbackOpen(feedbackOpen === prob.id ? null : prob.id)}
                                                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                                                                feedbackSubmitted.has(prob.id)
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                                                            }`}
                                                        >
                                                            <MessageSquare className="h-3.5 w-3.5" />
                                                            {feedbackSubmitted.has(prob.id) ? 'Feedback Logged' : 'Give Feedback'}
                                                        </button>

                                                        <button
                                                            onClick={() => setExpandedId(expandedId === prob.id ? null : prob.id)}
                                                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                                        >
                                                            {expandedId === prob.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Meta Info & Media Badges */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                                                            <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {prob.location}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Users className="h-3.5 w-3.5 text-slate-500" /> {prob.submittedBy || 'Citizen Rep'}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5 text-slate-500" /> {prob.submittedOn || 'Live'}
                                                        </span>
                                                    </div>

                                                    {/* Verified Proof Badges */}
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-400">
                                                            <Camera className="h-3 w-3" /> Photo
                                                        </span>
                                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                                                            <Mic className="h-3 w-3" /> Voice
                                                        </span>
                                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-purple-400">
                                                            <Video className="h-3 w-3" /> Video
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* EXPANDABLE DETAILS AREA */}
                                                {expandedId === prob.id && (
                                                    <div className="pt-4 border-t border-slate-800/80 space-y-4 text-xs">
                                                        {/* Full Problem Info Grid */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300">
                                                            <div>
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Unique Problem Code</span>
                                                                <span className="font-mono font-bold text-indigo-400 text-sm">{prob.id}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Subdomain / Sector</span>
                                                                <span className="font-medium text-white">{prob.subdomain || 'General'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Population Affected</span>
                                                                <span className="font-medium text-cyan-400">{prob.populationAffected || prob.population_affected || '100+ Citizens'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Reported By</span>
                                                                <span className="font-medium text-white">{prob.submittedBy || 'Citizen Representative'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase block">Location & District</span>
                                                                <span className="font-medium text-white">{prob.location}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase block">GPS Telemetry Coordinates</span>
                                                                <a
                                                                    href={`https://www.google.com/maps?q=${prob.lat || 23.344},${prob.lng || 85.309}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="font-medium text-indigo-400 hover:underline flex items-center gap-1"
                                                                >
                                                                    <MapPin className="h-3 w-3 text-cyan-400" /> {prob.lat || 23.344}°N, {prob.lng || 85.309}°E
                                                                </a>
                                                            </div>
                                                        </div>

                                                        {/* Full Problem Narrative */}
                                                        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-300 space-y-2">
                                                            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center justify-between">
                                                                <span>Detailed Problem Narrative</span>
                                                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Citizen Verified</span>
                                                            </h4>
                                                            <p className="leading-relaxed whitespace-pre-line text-slate-200">{prob.description}</p>
                                                        </div>

                                                        {/* Multimedia Evidence Section (Photo, Video, Document) */}
                                                        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                                                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                                                <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center gap-2">
                                                                    <span>🖼️ Multimedia Evidence (Photo, Video & Document)</span>
                                                                </h4>
                                                                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                                                                    Ground Evidence Telemetry
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                {/* 1. PHOTO EVIDENCE */}
                                                                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                                                            <Camera className="h-4 w-4 text-indigo-400" /> Photo Evidence
                                                                        </span>
                                                                        {prob.photo_url ? (
                                                                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                                                Uploaded
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                                                Not Uploaded
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {prob.photo_url ? (
                                                                        <div
                                                                            onClick={() => setLightboxMedia({ type: 'photo', url: prob.photo_url, title: prob.title })}
                                                                            className="relative overflow-hidden rounded-xl border border-slate-800 group/img cursor-pointer mt-1"
                                                                        >
                                                                            <img
                                                                                src={prob.photo_url}
                                                                                alt="Field Proof Photo"
                                                                                className="w-full h-40 object-cover rounded-xl transition-transform duration-300 group-hover/img:scale-105"
                                                                            />
                                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[11px] font-bold text-white flex-col gap-1 backdrop-blur-[2px]">
                                                                                <Eye className="h-5 w-5 text-indigo-400" />
                                                                                <span>Click to Expand Large View</span>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-32 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center text-slate-500 p-4 text-center mt-1">
                                                                            <Camera className="h-6 w-6 mb-1.5 opacity-40 text-slate-400" />
                                                                            <span className="text-xs font-bold text-slate-400">Not Uploaded</span>
                                                                            <span className="text-[10px] text-slate-500 mt-0.5">Submitting user did not attach photo</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* 2. VIDEO EVIDENCE */}
                                                                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                                                            <Video className="h-4 w-4 text-purple-400" /> Video Evidence
                                                                        </span>
                                                                        {prob.video_url ? (
                                                                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                                                Uploaded
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                                                Not Uploaded
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {prob.video_url ? (
                                                                        <div className="mt-1 space-y-2">
                                                                            <video controls src={prob.video_url} className="w-full h-32 rounded-xl border border-slate-800 bg-black object-cover" />
                                                                            <button
                                                                                onClick={() => setLightboxMedia({ type: 'video', url: prob.video_url, title: prob.title })}
                                                                                className="w-full py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition"
                                                                            >
                                                                                <Video className="h-3.5 w-3.5 text-purple-400" /> Play Large Screen Video
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-32 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center text-slate-500 p-4 text-center mt-1">
                                                                            <Video className="h-6 w-6 mb-1.5 opacity-40 text-purple-400" />
                                                                            <span className="text-xs font-bold text-slate-400">Not Uploaded</span>
                                                                            <span className="text-[10px] text-slate-500 mt-0.5">Submitting user did not record video</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* 3. DOCUMENT EVIDENCE */}
                                                                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                                                            <FileText className="h-4 w-4 text-emerald-400" /> Document Evidence
                                                                        </span>
                                                                        {prob.document_url ? (
                                                                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                                                Uploaded
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                                                Not Uploaded
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {prob.document_url ? (
                                                                        <div className="h-32 rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-3 flex flex-col items-center justify-center text-center mt-1 space-y-2">
                                                                            <FileText className="h-8 w-8 text-emerald-400" />
                                                                            <button
                                                                                onClick={() => window.open(prob.document_url, '_blank')}
                                                                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition shadow-md flex items-center gap-1.5"
                                                                            >
                                                                                Open Document in Browser ↗
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-32 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center text-slate-500 p-4 text-center mt-1">
                                                                            <FileText className="h-6 w-6 mb-1.5 opacity-40 text-emerald-400" />
                                                                            <span className="text-xs font-bold text-slate-400">Not Uploaded</span>
                                                                            <span className="text-[10px] text-slate-500 mt-0.5">Submitting user did not attach document</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* AI Explainability Rationale */}
                                                        <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 flex items-start gap-2.5">
                                                            <Brain className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <span className="font-bold text-white">AI Classification & Matching Confidence: 92%</span>
                                                                <p className="mt-0.5 text-[11px] text-slate-300">
                                                                    Categorized under <b>{prob.domain}</b> with high community impact score. Suitable for university engineering R&D and CSR grant co-funding.
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Interactive 7-Stage Timeline */}
                                                        <div className="space-y-2 pt-1">
                                                            <h4 className="font-bold text-slate-300 uppercase text-[11px] tracking-wider">7-Stage Resolution Journey</h4>
                                                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                                                {(prob.timeline || [
                                                                    { stage: 'Reported', done: true },
                                                                    { stage: 'AI Categorized', done: true },
                                                                    { stage: 'Officer Verified', done: prob.status !== 'Under Review' },
                                                                    { stage: 'University Match', done: prob.status === 'University Matched' || prob.status === 'In Progress' },
                                                                    { stage: 'Team Assigned', done: prob.status === 'In Progress' },
                                                                    { stage: 'CSR Grant', done: prob.status === 'In Progress' },
                                                                    { stage: 'Deployed Pilot', done: prob.status === 'Resolved' }
                                                                ]).map((step, idx, arr) => (
                                                                    <React.Fragment key={idx}>
                                                                        <div className="flex flex-col items-center min-w-[95px]">
                                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                                                step.done ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-500'
                                                                            }`}>
                                                                                {step.done ? <CheckCircle className="h-3.5 w-3.5" /> : idx + 1}
                                                                            </div>
                                                                            <span className={`text-[10px] font-bold mt-1 text-center ${step.done ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                                                {step.stage}
                                                                            </span>
                                                                        </div>
                                                                        {idx < arr.length - 1 && (
                                                                            <div className={`h-0.5 w-4 flex-shrink-0 ${step.done ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                                                                        )}
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* View Project Management Button */}
                                                        <div className="pt-2 flex justify-end border-t border-slate-800/80">
                                                            <Link
                                                                to={`/project-manager?problemId=${prob.id}`}
                                                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition"
                                                            >
                                                                ⚙️ View Project Management ↗
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* FEEDBACK INPUT FORM */}
                                                {feedbackOpen === prob.id && !feedbackSubmitted.has(prob.id) && (
                                                    <div className="pt-3 border-t border-slate-800 space-y-2">
                                                        <span className="text-xs font-bold text-slate-300">Submit Local Feedback or Status Update:</span>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="e.g., Ground situation is still critical, need urgent inspection..."
                                                                value={feedbackText}
                                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                            />
                                                            <button
                                                                onClick={() => handleFeedbackSubmit(prob.id)}
                                                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-md"
                                                            >
                                                                Submit
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* BOTTOM CALL TO ACTION */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 border border-indigo-500/30 p-8 text-center shadow-2xl space-y-4">
                    <div className="max-w-2xl mx-auto space-y-2">
                        <h3 className="text-2xl font-extrabold text-white">Spotted a Problem in Your Community?</h3>
                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                            Report water, electricity, sanitation, or infrastructure challenges. Our explainable AI system will categorize, prioritize, and match it to government nodal officers, university R&D labs, and CSR funding partners.
                        </p>
                    </div>
                    <Link
                        to="/submit"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all text-sm"
                    >
                        Report a Problem Now <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>

                {/* LIGHTBOX MEDIA OVERLAY MODAL */}
                {lightboxMedia && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 sm:p-6 animate-fadeIn">
                        <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/80">
                                <div className="flex items-center gap-2">
                                    {lightboxMedia.type === 'photo' ? (
                                        <Camera className="h-5 w-5 text-indigo-400" />
                                    ) : (
                                        <Video className="h-5 w-5 text-purple-400" />
                                    )}
                                    <span className="font-bold text-white text-sm">
                                        {lightboxMedia.title || (lightboxMedia.type === 'photo' ? 'Field Proof Photo View' : 'Field Proof Video Player')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setLightboxMedia(null)}
                                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                    title="Close Media View"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Media Display Area */}
                            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60 min-h-[300px]">
                                {lightboxMedia.type === 'photo' ? (
                                    <img
                                        src={lightboxMedia.url}
                                        alt="High Res Evidence Photo"
                                        className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl border border-slate-800"
                                    />
                                ) : (
                                    <video
                                        controls
                                        autoPlay
                                        src={lightboxMedia.url}
                                        className="max-h-[70vh] w-full rounded-xl shadow-2xl border border-slate-800 bg-black"
                                    />
                                )}
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
                                <span className="text-xs text-slate-400">Ground Reality Evidence Telemetry</span>
                                <a
                                    href={lightboxMedia.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg"
                                >
                                    Open Full Size in Browser Tab ↗
                                </a>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
