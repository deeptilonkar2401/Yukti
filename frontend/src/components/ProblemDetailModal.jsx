import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, MapPin, Clock, Users, Camera, Video, FileText, Brain,
  CheckCircle, ChevronUp, Flame, Eye, ExternalLink
} from 'lucide-react';

/* ──────────────────────────────────────────────
 * Helper: status badge colours (dark theme)
 * ────────────────────────────────────────────── */
function statusBadgeStyle(status) {
  switch ((status || '').toLowerCase()) {
    case 'under review':      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'university matched':return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    case 'in progress':       return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    case 'resolved':          return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    default:                  return 'bg-slate-700 text-slate-300 border-slate-600';
  }
}

function prioBadgeStyle(level) {
  switch ((level || '').toLowerCase()) {
    case 'critical': return 'bg-red-500/15 text-red-300 border-red-500/30';
    case 'high':     return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    case 'medium':   return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
    default:         return 'bg-slate-700 text-slate-300 border-slate-600';
  }
}

/* ──────────────────────────────────────────────
 * Lightbox for photo/video
 * ────────────────────────────────────────────── */
function Lightbox({ media, onClose }) {
  if (!media) return null;
  return (
    <div
      className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/80">
          <span className="font-bold text-white text-sm truncate">{media.title}</span>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-[300px] bg-black/40">
          {media.type === 'photo' ? (
            <img src={media.url} alt="Evidence" className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-2xl" />
          ) : (
            <video controls src={media.url} className="max-h-[65vh] max-w-full rounded-xl" autoPlay />
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Main ProblemDetailModal
 *
 * Props:
 *   prob         – problem object (same shape as API /api/problems)
 *   onClose      – callback to close modal
 *   showViewProjectBtn – if true, shows "View Project Manager" button at bottom
 * ────────────────────────────────────────────── */
export default function ProblemDetailModal({ prob, onClose, showViewProjectBtn = true }) {
  const navigate = useNavigate();
  const [lightboxMedia, setLightboxMedia] = useState(null);

  if (!prob) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6"
        onClick={onClose}
      >
        {/* Modal Panel */}
        <div
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/60 flex-shrink-0">
            <div className="space-y-1.5 flex-1 min-w-0">
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
                {(prob.votes || 0) >= 100 && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full">
                    <Flame className="h-3 w-3" /> Hot
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">{prob.title}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {prob.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-500" /> {prob.submittedBy || 'Citizen Rep'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" /> {prob.submittedOn || 'Live'}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <ChevronUp className="h-3.5 w-3.5 text-indigo-400" /> {prob.votes || 0} Votes
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">

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

            {/* Multimedia Evidence */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center gap-2">
                  🖼️ Multimedia Evidence (Photo, Video & Document)
                </h4>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
                  Ground Evidence Telemetry
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Photo */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Camera className="h-4 w-4 text-indigo-400" /> Photo Evidence
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${prob.photo_url ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {prob.photo_url ? 'Uploaded' : 'Not Uploaded'}
                    </span>
                  </div>
                  {prob.photo_url ? (
                    <div
                      onClick={() => setLightboxMedia({ type: 'photo', url: prob.photo_url, title: prob.title })}
                      className="relative overflow-hidden rounded-xl border border-slate-800 group/img cursor-pointer mt-1"
                    >
                      <img src={prob.photo_url} alt="Field Proof Photo" className="w-full h-40 object-cover rounded-xl transition-transform duration-300 group-hover/img:scale-105" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-[11px] font-bold text-white flex-col gap-1 backdrop-blur-[2px]">
                        <Eye className="h-5 w-5 text-indigo-400" />
                        <span>Click to Expand</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center text-slate-500 p-4 text-center mt-1">
                      <Camera className="h-6 w-6 mb-1.5 opacity-40 text-slate-400" />
                      <span className="text-xs font-bold text-slate-400">Not Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Video */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-purple-400" /> Video Evidence
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${prob.video_url ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {prob.video_url ? 'Uploaded' : 'Not Uploaded'}
                    </span>
                  </div>
                  {prob.video_url ? (
                    <div className="mt-1 space-y-2">
                      <video controls src={prob.video_url} className="w-full h-32 rounded-xl border border-slate-800 bg-black object-cover" />
                      <button
                        onClick={() => setLightboxMedia({ type: 'video', url: prob.video_url, title: prob.title })}
                        className="w-full py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition"
                      >
                        <Video className="h-3.5 w-3.5" /> Play Full Screen
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center text-slate-500 p-4 text-center mt-1">
                      <Video className="h-6 w-6 mb-1.5 opacity-40 text-purple-400" />
                      <span className="text-xs font-bold text-slate-400">Not Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Document */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-emerald-400" /> Document Evidence
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${prob.document_url ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {prob.document_url ? 'Uploaded' : 'Not Uploaded'}
                    </span>
                  </div>
                  {prob.document_url ? (
                    <div className="h-32 rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-3 flex flex-col items-center justify-center text-center mt-1 space-y-2">
                      <FileText className="h-8 w-8 text-emerald-400" />
                      <button
                        onClick={() => window.open(prob.document_url, '_blank')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition shadow-md flex items-center gap-1.5"
                      >
                        Open Document ↗
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center text-slate-500 p-4 text-center mt-1">
                      <FileText className="h-6 w-6 mb-1.5 opacity-40 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-400">Not Uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Classification */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 flex items-start gap-2.5">
              <Brain className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">AI Classification & Matching Confidence: 92%</span>
                <p className="mt-0.5 text-[11px] text-slate-300">
                  Categorized under <b>{prob.domain}</b> with high community impact score. Suitable for university engineering R&D and CSR grant co-funding.
                </p>
              </div>
            </div>

            {/* 7-Stage Resolution Journey */}
            <div className="space-y-2 pt-1">
              <h4 className="font-bold text-slate-300 uppercase text-[11px] tracking-wider">7-Stage Resolution Journey</h4>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {(prob.timeline || [
                  { stage: 'Reported',         done: true },
                  { stage: 'AI Categorized',   done: true },
                  { stage: 'Officer Verified', done: prob.status !== 'Under Review' },
                  { stage: 'University Match', done: ['University Matched', 'In Progress', 'Resolved'].includes(prob.status) },
                  { stage: 'Team Assigned',    done: ['In Progress', 'Resolved'].includes(prob.status) },
                  { stage: 'CSR Grant',        done: ['In Progress', 'Resolved'].includes(prob.status) },
                  { stage: 'Deployed Pilot',   done: prob.status === 'Resolved' },
                ]).map((step, idx, arr) => (
                  <React.Fragment key={idx}>
                    <div className="flex flex-col items-center min-w-[95px]">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${step.done ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-500'}`}>
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

            {/* View Project Manager Button (optional) */}
            {showViewProjectBtn && (
              <div className="pt-2 flex justify-end border-t border-slate-800/80">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/project-manager?problemId=${prob.id}`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Project Manager ↗
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox overlay */}
      <Lightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />
    </>
  );
}
