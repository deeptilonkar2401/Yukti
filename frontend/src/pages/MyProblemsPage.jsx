import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Star, MapPin, Clock, CheckCircle, AlertTriangle,
    Eye, PlusCircle, ArrowRight, Send, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusColor = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'completed':
        case 'resolved':
            return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        case 'in_progress':
        case 'in progress':
            return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'matched':
        case 'university matched':
            return 'bg-indigo-100 text-indigo-800 border-indigo-300';
        case 'verified':
            return 'bg-teal-100 text-teal-800 border-teal-300';
        default:
            return 'bg-amber-100 text-amber-800 border-amber-300';
    }
};

export default function MyProblemsPage() {
    const { token } = useAuth();
    const [myProblems, setMyProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [clarificationTexts, setClarificationTexts] = useState({});
    const [submittingClarification, setSubmittingClarification] = useState({});

    const fetchMyProblems = async () => {
        setLoading(true);
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch('/api/problems?mine=true', { headers });
            if (res.ok) {
                const data = await res.json();
                setMyProblems(data);
            }
        } catch (e) {
            console.error("Failed to fetch user problems:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProblems();
    }, [token]);

    const handleRespondClarification = async (problemId) => {
        const text = clarificationTexts[problemId];
        if (!text || !text.trim()) return;

        setSubmittingClarification(prev => ({ ...prev, [problemId]: true }));
        try {
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            };
            const res = await fetch(`/api/problems/${problemId}/respond-clarification`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ response: text })
            });

            if (res.ok) {
                alert("Clarification response submitted successfully!");
                setClarificationTexts(prev => ({ ...prev, [problemId]: '' }));
                fetchMyProblems();
            } else {
                alert("Could not submit clarification response.");
            }
        } catch (e) {
            alert("Network error while submitting clarification.");
        } finally {
            setSubmittingClarification(prev => ({ ...prev, [problemId]: false }));
        }
    };

    const buildLifecycleTimeline = (prob) => {
        const s = (prob.status || 'submitted').toLowerCase();

        const isVerified = s === 'verified' || s === 'matched' || s === 'in_progress' || s === 'completed';
        const isMatched = s === 'matched' || s === 'in_progress' || s === 'completed';
        const isInProgress = s === 'in_progress' || s === 'completed';
        const isCompleted = s === 'completed';

        return [
            { stage: "Submitted", done: true, date: prob.created_at ? new Date(prob.created_at).toLocaleDateString() : 'Done' },
            { stage: "AI Categorization", done: true, date: 'Auto' },
            { stage: "Admin Approval", done: isVerified, date: isVerified ? 'Verified' : 'Pending Review' },
            { stage: "University Matched", done: isMatched, date: isMatched ? 'Matched' : 'Awaiting Match' },
            { stage: "Team & Proposal", done: isInProgress, date: isInProgress ? 'Assigned' : 'Pending' },
            { stage: "Industry CSR Partner", done: isInProgress, date: isInProgress ? 'Active Support' : 'Open Pool' },
            { stage: "Field Testing & Impact", done: isCompleted, date: isCompleted ? 'Completed' : 'In Pipeline' }
        ];
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-primary to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Star className="h-6 w-6 text-amber-400" /> My Submitted Problems & Live Status
                    </h1>
                    <p className="text-xs text-indigo-200 mt-1">
                        Track the real-time condition and end-to-end lifecycle progress of your reported issues.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchMyProblems}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <Link
                        to="/submit"
                        className="bg-accent hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm"
                    >
                        <PlusCircle className="h-4 w-4" /> Submit New Problem
                    </Link>
                </div>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
                    <p className="font-bold text-slate-700">Loading your submitted problems...</p>
                </div>
            ) : myProblems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
                    <h2 className="text-lg font-bold text-mainText">No Problems Submitted Yet</h2>
                    <p className="text-sm text-subText max-w-md mx-auto">
                        You have not reported any local issues yet. Report a problem in your area to start tracking its progress from Admin Verification to University Solution.
                    </p>
                    <Link
                        to="/submit"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-indigo-900 text-white font-bold px-6 py-2.5 rounded-lg text-sm shadow-md transition"
                    >
                        Submit a Problem <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {myProblems.map(prob => {
                        const timeline = buildLifecycleTimeline(prob);
                        return (
                            <div key={prob.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-indigo-300 transition">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-xs text-primary font-bold">ID: {prob.id.substring(0, 8)}</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(prob.status)}`}>
                                                {(prob.status || 'submitted').toUpperCase()}
                                            </span>
                                            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                                {prob.domain}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-mainText text-lg">{prob.title}</h3>
                                        <p className="text-xs text-subText flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-secondary" /> {prob.location_text || 'Jharkhand'} · <Clock className="h-3.5 w-3.5" /> {prob.created_at ? new Date(prob.created_at).toLocaleDateString('en-IN') : 'Recently'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setExpandedId(expandedId === prob.id ? null : prob.id)}
                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition"
                                    >
                                        <Eye className="h-4 w-4" /> {expandedId === prob.id ? 'Hide Details' : 'View Description'}
                                    </button>
                                </div>

                                {/* Clarification Request Warning Box */}
                                {prob.clarification_requested && (
                                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-3">
                                        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                                            Action Required: Clarification Requested by Admin / University Team
                                        </div>
                                        <p className="text-amber-900 font-medium bg-amber-100/60 p-2.5 rounded-lg border border-amber-200">
                                            "{prob.clarification_prompt || 'Please provide additional photos or specific location coordinates.'}"
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Type your clarification response..."
                                                value={clarificationTexts[prob.id] || ''}
                                                onChange={(e) => setClarificationTexts({ ...clarificationTexts, [prob.id]: e.target.value })}
                                                className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-mainText focus:outline-none focus:border-amber-500"
                                            />
                                            <button
                                                onClick={() => handleRespondClarification(prob.id)}
                                                disabled={submittingClarification[prob.id]}
                                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <Send className="h-3.5 w-3.5" /> Submit Response
                                            </button>
                                        </div>
                                    </div>
                                )}

                                 {/* Expanded Description & Ground Proof Media Attachments */}
                                 {expandedId === prob.id && (
                                     <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3">
                                         <div>
                                             <p className="font-bold text-slate-900 mb-1">Problem Narrative & Description:</p>
                                             <p className="leading-relaxed whitespace-pre-line">{prob.description}</p>
                                             {prob.population_affected && (
                                                 <p className="text-indigo-700 font-semibold mt-1">👥 Affected Population: {prob.population_affected}</p>
                                             )}
                                         </div>

                                         <div className="border-t border-slate-200 pt-2 space-y-2">
                                             <p className="font-bold text-slate-900">🖼️ Submitted Ground Proof Attachments:</p>
                                             {/* Photo Evidence Image */}
                                             <div className="space-y-1">
                                                 <span className="text-[11px] font-semibold text-slate-500 block">📷 Field Evidence Photo:</span>
                                                 {prob.photo_url ? (
                                                     <img
                                                         src={prob.photo_url}
                                                         alt="Field Proof Photo"
                                                         className="w-full max-h-64 object-cover rounded-xl border border-slate-300 shadow-sm cursor-pointer"
                                                         onClick={() => window.open(prob.photo_url, '_blank')}
                                                     />
                                                 ) : (
                                                     <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 text-xs text-center font-bold">
                                                         Not Uploaded (No Photo Evidence Provided)
                                                     </div>
                                                 )}
                                             </div>

                                             {/* Video Player */}
                                             <div className="space-y-1 pt-1">
                                                 <span className="text-[11px] font-semibold text-purple-700 block">📹 Video Recording Clip:</span>
                                                 {prob.video_url ? (
                                                     <video controls src={prob.video_url} className="w-full max-h-48 rounded-xl border border-slate-300 bg-black" />
                                                 ) : (
                                                     <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 text-xs text-center font-bold">
                                                         Not Uploaded (No Video Evidence Recorded)
                                                     </div>
                                                 )}
                                             </div>

                                             {/* Voice Note */}
                                             <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 space-y-0.5">
                                                 <span className="font-bold block text-[11px]">🎙️ Spoken Voice Note Grievance:</span>
                                                 <p className="text-[11px] italic text-indigo-800">
                                                     "{prob.voice_url || (prob.description.includes('🗣️ Original') ? prob.description.substring(0, 150) + '...' : 'Recorded voice grievance auto-captured via AI Assistant.')}"
                                                 </p>
                                             </div>

                                             {/* Document Download Link */}
                                             <div className="pt-1">
                                                 <span className="text-[11px] font-semibold text-slate-500 block mb-1">📄 Document Evidence:</span>
                                                 {prob.document_url ? (
                                                     <a
                                                         href={prob.document_url}
                                                         target="_blank"
                                                         rel="noopener noreferrer"
                                                         download
                                                         className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
                                                     >
                                                         📥 Download Attached Document Evidence
                                                     </a>
                                                 ) : (
                                                     <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 text-xs text-center font-bold">
                                                         Not Uploaded (No Document Evidence Attached)
                                                     </div>
                                                 )}
                                             </div>
                                         </div>
                                     </div>
                                 )}

                                {/* 7-Stage Problem-to-Solution Journey Lifecycle Timeline */}
                                <div className="pt-3 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                                        SIH26043 Problem-to-Solution Lifecycle Tracker
                                    </h4>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                        {timeline.map((step, idx) => (
                                            <React.Fragment key={idx}>
                                                <div className="flex flex-col items-center min-w-[110px]">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        step.done
                                                            ? 'bg-emerald-500 text-white shadow-md'
                                                            : 'bg-slate-200 text-slate-500'
                                                    }`}>
                                                        {step.done ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                                                    </div>
                                                    <p className={`text-[10px] font-bold mt-1.5 text-center leading-tight ${
                                                        step.done ? 'text-emerald-700' : 'text-slate-500'
                                                    }`}>
                                                        {step.stage}
                                                    </p>
                                                    <p className="text-[9px] text-subText mt-0.5">{step.date}</p>
                                                </div>
                                                {idx < timeline.length - 1 && (
                                                    <div className={`h-0.5 w-6 flex-shrink-0 ${step.done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
