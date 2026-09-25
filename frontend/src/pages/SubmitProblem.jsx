import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../context/ProblemContext';
import {
  Sparkles, MapPin, CheckCircle, Image as ImageIcon, Video,
  FileText, Loader2, Navigation, ChevronRight, AlertTriangle,
  Brain, Shield, GraduationCap, Building, BarChart3, Copy, Users, Mic, MicOff, Globe, Languages,
  Camera, Upload, X, Play, Square, Radio
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ──────────────────────────────────────────────
   AI SIMULATION — domain classification,
   priority scoring, duplicate detection,
   and university matching
────────────────────────────────────────────── */
const DOMAIN_MAP = [
  { keywords: ['water', 'drinking', 'well', 'borewell', 'pipeline', 'tap', 'canal', 'river', 'flood', 'dam', 'irrigation', 'drought'], domain: 'Water Management', subdomain: 'Water Supply' },
  { keywords: ['drainage', 'sewage', 'toilet', 'waste', 'garbage', 'sanitation', 'hygiene', 'sewer', 'dumping'], domain: 'Sanitation', subdomain: 'Waste Management' },
  { keywords: ['crop', 'farm', 'agri', 'pest', 'seed', 'soil', 'harvest', 'cattle', 'dairy', 'livestock', 'fertilizer'], domain: 'Agriculture', subdomain: 'Crop Protection' },
  { keywords: ['school', 'education', 'teacher', 'student', 'literacy', 'digital', 'learning', 'college'], domain: 'Education', subdomain: 'Access & Quality' },
  { keywords: ['hospital', 'doctor', 'health', 'medicine', 'clinic', 'disease', 'patient', 'ambulance', 'maternal'], domain: 'Healthcare', subdomain: 'Medical Access' },
  { keywords: ['road', 'bridge', 'traffic', 'transport', 'bus', 'railway', 'pothole', 'construction', 'building', 'urban'], domain: 'Urban Infrastructure', subdomain: 'Transport & Roads' },
  { keywords: ['solar', 'electricity', 'power', 'energy', 'grid', 'light', 'blackout', 'voltage'], domain: 'Energy', subdomain: 'Power Supply' },
  { keywords: ['forest', 'pollution', 'air', 'environment', 'plastic', 'climate', 'carbon', 'tree', 'green'], domain: 'Environment', subdomain: 'Pollution Control' },
  { keywords: ['disabled', 'handicap', 'accessibility', 'ramp', 'wheelchair', 'blind', 'deaf'], domain: 'Accessibility', subdomain: 'Inclusive Infrastructure' },
  { keywords: ['livelihood', 'employment', 'income', 'poverty', 'rural', 'village', 'tribal', 'artisan', 'craft'], domain: 'Rural Livelihood', subdomain: 'Income Generation' },
];

const EXISTING_PROBLEMS = [
  { id: 'YUKTI-8840', title: 'Fluoride contamination in groundwater sources in Palamu district', domain: 'Water Management' },
  { id: 'YUKTI-8712', title: 'Tribal farmers losing lac crop due to pest infestation in Khunti', domain: 'Agriculture' },
  { id: 'YUKTI-8691', title: 'No drinking water in Santal Pargana villages during summer', domain: 'Water Management' },
  { id: 'YUKTI-8590', title: 'Stagnant water near Ranchi government school causing malaria', domain: 'Sanitation' },
  { id: 'YUKTI-8445', title: 'Paddy crop losses due to unknown pest attacks in Dumka', domain: 'Agriculture' },
  { id: 'YUKTI-8321', title: 'Monsoon flooding in Kadma area of Jamshedpur', domain: 'Urban Infrastructure' },
];

const UNIVERSITIES = [
  { name: 'BIT Mesra, Ranchi', dept: 'Civil & Environmental Engg', strengths: ['Water Management', 'Urban Infrastructure', 'Sanitation'], pastProjects: 4, distance: '15 km', faculty: 5 },
  { name: 'IIT(ISM) Dhanbad', dept: 'Environmental Science', strengths: ['Environment', 'Water Management', 'Energy'], pastProjects: 6, distance: '180 km', faculty: 6 },
  { name: 'NIT Jamshedpur', dept: 'Computer Science & Engg', strengths: ['Agriculture', 'Healthcare', 'IoT'], pastProjects: 3, distance: '130 km', faculty: 4 },
  { name: 'Central Univ of Jharkhand', dept: 'Centre for Land & Water', strengths: ['Agriculture', 'Rural Livelihood', 'Environment'], pastProjects: 5, distance: '25 km', faculty: 4 },
  { name: 'Birsa Agricultural Univ', dept: 'Crop Science & Protection', strengths: ['Agriculture', 'Environment', 'Rural Livelihood'], pastProjects: 8, distance: '10 km', faculty: 7 },
  { name: 'XLRI Jamshedpur', dept: 'Social Initiatives', strengths: ['Education', 'Rural Livelihood', 'Accessibility'], pastProjects: 3, distance: '130 km', faculty: 3 },
  { name: 'Ranchi University', dept: 'Applied Sciences', strengths: ['Healthcare', 'Education', 'Sanitation'], pastProjects: 2, distance: '5 km', faculty: 4 },
];

function classifyDomain(text) {
  const lower = text.toLowerCase();
  const scores = DOMAIN_MAP.map(d => ({
    ...d,
    score: d.keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0),
  }));
  scores.sort((a, b) => b.score - a.score);
  const top = scores.filter(s => s.score > 0).slice(0, 3);
  if (top.length === 0) return [{ domain: 'General', subdomain: 'Uncategorized', confidence: 50 }];
  const maxScore = top[0].score;
  return top.map(s => ({ domain: s.domain, subdomain: s.subdomain, confidence: Math.min(98, Math.round((s.score / Math.max(maxScore, 1)) * 92) + 6) }));
}

function extractKeywords(text) {
  const lower = text.toLowerCase();
  const allKeywords = DOMAIN_MAP.flatMap(d => d.keywords);
  return [...new Set(allKeywords.filter(kw => lower.includes(kw)))].slice(0, 8);
}

function computePriority(text) {
  const lower = text.toLowerCase();
  const factors = {
    affectedPopulation: 0,
    severity: 0,
    urgency: 0,
    geographicSpread: 0,
    govRelevance: 0,
  };
  // affected population signals
  if (/village|community|area|district|ward|hamlet/.test(lower)) factors.affectedPopulation += 25;
  if (/thousands|lakh|many|population|residents|families/.test(lower)) factors.affectedPopulation += 30;
  if (/school|hospital|public/.test(lower)) factors.affectedPopulation += 20;
  // severity
  if (/disease|death|danger|hazard|toxic|contaminated|unsafe/.test(lower)) factors.severity += 30;
  if (/no |lack|shortage|unavail|broken|damaged|failed/.test(lower)) factors.severity += 20;
  if (/stagnant|overflow|flood|collapse/.test(lower)) factors.severity += 15;
  // urgency
  if (/immediate|urgent|emergency|crisis|critical/.test(lower)) factors.urgency += 30;
  if (/every|daily|season|monsoon|summer|winter|recurring/.test(lower)) factors.urgency += 20;
  if (/years|months|long time/.test(lower)) factors.urgency += 10;
  // geographic spread
  if (/district|state|region|multiple|several|many village/.test(lower)) factors.geographicSpread += 25;
  if (/rural|remote|tribal|interior/.test(lower)) factors.geographicSpread += 15;
  // gov relevance
  if (/government|public|municipal|panchayat|civic/.test(lower)) factors.govRelevance += 25;
  if (/school|hospital|road|bridge|water supply/.test(lower)) factors.govRelevance += 20;

  const score = Math.min(100, Math.round(
    factors.affectedPopulation * 0.30 +
    factors.severity * 0.20 +
    factors.urgency * 0.20 +
    factors.geographicSpread * 0.15 +
    factors.govRelevance * 0.15
  ));

  const reasons = [];
  if (factors.affectedPopulation >= 20) reasons.push('Large affected population');
  if (factors.severity >= 20) reasons.push('High severity — essential service disruption');
  if (factors.urgency >= 20) reasons.push('Recurring / urgent issue');
  if (factors.geographicSpread >= 15) reasons.push('Affects rural/remote areas');
  if (factors.govRelevance >= 20) reasons.push('Public service importance');
  if (reasons.length === 0) reasons.push('Standard community concern');

  const level = score >= 81 ? 'Critical' : score >= 61 ? 'High' : score >= 31 ? 'Medium' : 'Low';
  return { score, level, factors, reasons };
}

function findDuplicates(title, description) {
  const input = (title + ' ' + description).toLowerCase();
  const inputWords = new Set(input.split(/\W+/).filter(w => w.length > 3));
  return EXISTING_PROBLEMS.map(p => {
    const pWords = new Set(p.title.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const intersection = [...inputWords].filter(w => pWords.has(w)).length;
    const union = new Set([...inputWords, ...pWords]).size;
    const similarity = union > 0 ? Math.round((intersection / union) * 100) : 0;
    return { ...p, similarity };
  }).filter(p => p.similarity > 20).sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}

function matchUniversities(domain) {
  return UNIVERSITIES.map(u => {
    let score = 0;
    const reasons = [];
    // domain expertise (40%)
    if (u.strengths.includes(domain)) { score += 40; reasons.push(`${u.dept} — direct domain expertise`); }
    else if (u.strengths.some(s => s.toLowerCase().includes(domain.split(' ')[0].toLowerCase()))) { score += 20; reasons.push('Related domain expertise'); }
    // faculty (25%)
    const facultyScore = Math.min(25, Math.round(u.faculty / 6 * 25));
    score += facultyScore;
    if (u.faculty >= 4) reasons.push(`${u.faculty} faculty members in related field`);
    // past projects (15%)
    const projScore = Math.min(15, Math.round(u.pastProjects / 7 * 15));
    score += projScore;
    if (u.pastProjects >= 2) reasons.push(`${u.pastProjects} previous related projects`);
    // geography bonus (10%)
    const dist = parseInt(u.distance);
    const geoScore = dist <= 100 ? 10 : dist <= 200 ? 6 : 3;
    score += geoScore;
    if (dist <= 100) reasons.push(`Located within ${u.distance}`);
    // research facilities (10%)
    score += 7;
    reasons.push('Research lab & facilities available');

    return { ...u, score: Math.min(98, score), reasons };
  }).sort((a, b) => b.score - a.score).slice(0, 5);
}

/* ──────────────────────────────────────────────
   JHARKHAND DISTRICTS — for clickable map
────────────────────────────────────────────── */
const JHARKHAND_DISTRICTS = [
  { name: 'Ranchi', lat: 23.34, lng: 85.31, x: 38, y: 52 },
  { name: 'Jamshedpur', lat: 22.80, lng: 86.20, x: 55, y: 72 },
  { name: 'Dhanbad', lat: 23.79, lng: 86.43, x: 70, y: 30 },
  { name: 'Dumka', lat: 24.27, lng: 87.25, x: 78, y: 22 },
  { name: 'Palamu', lat: 23.95, lng: 84.08, x: 15, y: 30 },
  { name: 'Giridih', lat: 24.19, lng: 86.30, x: 55, y: 28 },
  { name: 'Hazaribagh', lat: 23.99, lng: 85.36, x: 40, y: 32 },
  { name: 'Bokaro', lat: 23.67, lng: 86.15, x: 60, y: 42 },
  { name: 'Deoghar', lat: 24.48, lng: 86.70, x: 72, y: 18 },
  { name: 'Khunti', lat: 23.07, lng: 85.28, x: 32, y: 60 },
  { name: 'Latehar', lat: 23.74, lng: 84.50, x: 18, y: 48 },
  { name: 'Simdega', lat: 22.61, lng: 84.50, x: 18, y: 68 },
  { name: 'Gumla', lat: 23.04, lng: 84.54, x: 22, y: 58 },
  { name: 'Lohardaga', lat: 23.44, lng: 84.68, x: 25, y: 50 },
  { name: 'East Singhbhum', lat: 22.57, lng: 86.21, x: 58, y: 78 },
  { name: 'West Singhbhum', lat: 22.36, lng: 85.63, x: 42, y: 80 },
  { name: 'Saraikela', lat: 22.70, lng: 85.93, x: 48, y: 75 },
  { name: 'Ramgarh', lat: 23.63, lng: 85.56, x: 48, y: 42 },
  { name: 'Chatra', lat: 24.21, lng: 84.87, x: 28, y: 28 },
  { name: 'Koderma', lat: 24.47, lng: 85.59, x: 48, y: 18 },
  { name: 'Jamtara', lat: 23.96, lng: 86.80, x: 78, y: 36 },
  { name: 'Pakur', lat: 24.63, lng: 87.84, x: 88, y: 15 },
  { name: 'Sahebganj', lat: 25.25, lng: 87.64, x: 85, y: 8 },
  { name: 'Godda', lat: 24.83, lng: 87.21, x: 80, y: 10 },
];

/* ──────────────────────────────────────────────
   COMPONENT
────────────────────────────────────────────── */
export default function SubmitProblem() {
  const navigate = useNavigate();
  const { addProblem } = useProblems();
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    submitterType: 'Individual', // Default submitter type
  });
  const [mediaFiles, setMediaFiles] = useState({ image: null, video: null, document: null });
  const [analysisResults, setAnalysisResults] = useState(null);
  const [detectedLocation, setDetectedLocation] = useState(false);

  // Camera & Video capture state
  const [photoOptionModal, setPhotoOptionModal] = useState(false);
  const [videoOptionModal, setVideoOptionModal] = useState(false);
  const [showPhotoCamera, setShowPhotoCamera] = useState(false);
  const [showVideoCamera, setShowVideoCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const photoVideoRef = useRef(null);
  const photoStreamRef = useRef(null);
  const videoStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const startPhotoCamera = async () => {
    try {
      setPhotoOptionModal(false);
      setShowPhotoCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      photoStreamRef.current = stream;
      setTimeout(() => {
        if (photoVideoRef.current) {
          photoVideoRef.current.srcObject = stream;
        }
      }, 200);
    } catch (err) {
      alert("Camera access denied or unavailable. Please select 'Upload Photo from Files'.");
      setShowPhotoCamera(false);
    }
  };

  const stopPhotoCamera = () => {
    if (photoStreamRef.current) {
      photoStreamRef.current.getTracks().forEach(track => track.stop());
      photoStreamRef.current = null;
    }
    setShowPhotoCamera(false);
  };

  const capturePhotoSnap = () => {
    if (!photoVideoRef.current) return;
    const videoEl = photoVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setMediaFiles(prev => ({ ...prev, image: dataUrl }));
    stopPhotoCamera();
  };

  const startVideoCamera = async () => {
    try {
      setVideoOptionModal(false);
      setShowVideoCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
      videoStreamRef.current = stream;
      setTimeout(() => {
        if (photoVideoRef.current) {
          photoVideoRef.current.srcObject = stream;
        }
      }, 200);
    } catch (err) {
      alert("Camera/microphone access denied or unavailable. Please select 'Upload Video from Files'.");
      setShowVideoCamera(false);
    }
  };

  const stopVideoCamera = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
    setShowVideoCamera(false);
    setRecordingTime(0);
  };

  const startVideoRecording = () => {
    if (!videoStreamRef.current) return;
    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(videoStreamRef.current);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaFiles(prev => ({ ...prev, video: reader.result }));
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Failed to start video recorder.");
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
    setTimeout(() => {
      stopVideoCamera();
    }, 300);
  };

  // Voice Bot state
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'done'
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState({ original: '', en: '', hi: '' });
  const [aiGeneratedTitle, setAiGeneratedTitle] = useState('');
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  // Map state
  const [showMap, setShowMap] = useState(true);
  const [currentCoords, setCurrentCoords] = useState([23.344, 85.309]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
    }
  };

  const handleDetectLocation = () => {
    setDetectedLocation(true);
    setTimeout(() => {
      setFormData(prev => ({ ...prev, location: 'Ranchi, Jharkhand (23.344°N, 85.309°E)' }));
      setCurrentCoords([23.344, 85.309]);
      if (mapInstance.current && markerInstance.current) {
        mapInstance.current.setView([23.344, 85.309], 14);
        markerInstance.current.setLatLng([23.344, 85.309]);
      }
    }, 800);
  };

  // Forward Geocoding when location text changes manually
  useEffect(() => {
    if (!formData.location || formData.location.includes('°N') || formData.location.includes('Selected')) return;
    const timeoutId = setTimeout(async () => {
      try {
        const query = encodeURIComponent(formData.location + ', Jharkhand, India');
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
        const data = await res.json();

        let targetLat = null;
        let targetLon = null;

        if (data && data.length > 0) {
          targetLat = parseFloat(data[0].lat);
          targetLon = parseFloat(data[0].lon);
        } else {
          // DEMO FAILSAFE: If the free API misses it because of a weird spelling, we manually check districts
          const locLower = formData.location.toLowerCase();
          if (locLower.includes('lok bhavan')) { targetLat = 23.3600; targetLon = 85.3200; } // Very specific
          else if (locLower.includes('ranchi') || locLower.includes('harmu')) { targetLat = 23.344; targetLon = 85.309; }
          else if (locLower.includes('palamu')) { targetLat = 24.037; targetLon = 84.067; }
          else if (locLower.includes('giridih')) { targetLat = 24.180; targetLon = 86.302; }
          else if (locLower.includes('dumka')) { targetLat = 24.269; targetLon = 87.251; }
          else if (locLower.includes('khunti')) { targetLat = 23.076; targetLon = 85.275; }
          else if (locLower.includes('latehar')) { targetLat = 23.743; targetLon = 84.503; }
          else if (locLower.includes('jamshedpur') || locLower.includes('kadma')) { targetLat = 22.804; targetLon = 86.202; }
          else if (locLower.includes('deoghar')) { targetLat = 24.484; targetLon = 86.697; }
        }

        if (targetLat !== null && targetLon !== null) {
          setCurrentCoords([targetLat, targetLon]);
          if (mapInstance.current && markerInstance.current) {
            mapInstance.current.setView([targetLat, targetLon], 13);
            markerInstance.current.setLatLng([targetLat, targetLon]);
          }
          setDetectedLocation(true);
        }
      } catch (err) {
        console.error('Geocoding failed', err);
      }
    }, 1200);
    return () => clearTimeout(timeoutId);
  }, [formData.location]);

  // Map Initialization
  useEffect(() => {
    if (showMap && mapRef.current && !mapInstance.current) {
      const map = L.map(mapRef.current).setView(currentCoords, 7);

      L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        maxZoom: 20
      }).addTo(map);

      // Red circle marker
      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.6);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      markerInstance.current = L.marker(currentCoords, { icon: customIcon }).addTo(map);

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        setCurrentCoords([lat, lng]);
        markerInstance.current.setLatLng([lat, lng]);

        try {
          // Reverse geocode to get name of location click
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          if (data && data.display_name) {
            // Clean up the very long string
            const parts = data.display_name.split(',');
            const shortName = parts.slice(0, Math.min(3, parts.length)).join(', ').trim();
            setFormData(prev => ({ ...prev, location: shortName }));
          } else {
            setFormData(prev => ({ ...prev, location: `Selected Map Point (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)` }));
          }
        } catch (err) {
          setFormData(prev => ({ ...prev, location: `Selected Map Point (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)` }));
        }
        setDetectedLocation(true);
      });

      mapInstance.current = map;
    }

    return () => {
      if (!showMap && mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [showMap, currentCoords]);

  /* ──── VOICE BOT LOGIC ──── */
  const generateAiTitle = (text) => {
    // Simulated AI title generation — extracts key phrases to form a title
    const lower = text.toLowerCase();
    const titleKeywords = [
      { kw: ['water', 'drinking', 'well', 'pipeline', 'flood', 'drainage'], title: 'Water & Drainage Issue' },
      { kw: ['road', 'pothole', 'bridge', 'traffic'], title: 'Road Infrastructure Problem' },
      { kw: ['school', 'education', 'teacher', 'student'], title: 'Education Access Concern' },
      { kw: ['hospital', 'doctor', 'health', 'medicine', 'clinic'], title: 'Healthcare Service Gap' },
      { kw: ['crop', 'farm', 'pest', 'harvest', 'seed'], title: 'Agricultural Challenge' },
      { kw: ['electricity', 'power', 'solar', 'blackout'], title: 'Power Supply Disruption' },
      { kw: ['garbage', 'waste', 'sewage', 'toilet', 'sanitation'], title: 'Sanitation & Hygiene Issue' },
      { kw: ['forest', 'pollution', 'environment', 'plastic'], title: 'Environmental Concern' },
    ];
    for (const entry of titleKeywords) {
      if (entry.kw.some(k => lower.includes(k))) {
        // Add location context if found
        const locations = ['ranchi', 'jamshedpur', 'dhanbad', 'dumka', 'palamu', 'giridih', 'hazaribagh', 'bokaro', 'deoghar', 'khunti', 'latehar', 'simdega', 'gumla'];
        const foundLoc = locations.find(l => lower.includes(l));
        return foundLoc
          ? `${entry.title} in ${foundLoc.charAt(0).toUpperCase() + foundLoc.slice(1)}`
          : entry.title + ' — Community Report';
      }
    }
    // Fallback: use first few words
    const words = text.split(/\s+/).slice(0, 8).join(' ');
    return words.length > 5 ? words + '...' : 'Community Problem Report';
  };

  const simulateTranslation = (text) => {
    // Simulated AI translation for demo
    // In production, this would call Google Translate / Bhashini API
    const enText = `(Translated to English) ${text}`;
    const hiText = `(हिंदी अनुवाद) ${text}`;
    return { original: text, en: enText, hi: hiText };
  };

  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Sets language to support Indian regional accents and mixed English better
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setVoiceState('listening');
      setVoiceTranscript('');
      transcriptRef.current = '';
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
      setVoiceTranscript(transcript);
      transcriptRef.current = transcript;
    };

    recognition.onend = () => {
      setVoiceState('processing');
      // Simulate AI processing — translate + generate title
      setTimeout(() => {
        const finalTranscript = transcriptRef.current;
        if (!finalTranscript.trim()) {
          setVoiceState('idle');
          alert("We didn't catch that. Please try speaking a bit closer to the microphone.");
          return;
        }

        const spokenText = finalTranscript;
        const translated = simulateTranslation(spokenText);
        setTranslatedText(translated);

        // AI generates a title from the spoken content
        const title = generateAiTitle(spokenText);
        setAiGeneratedTitle(title);

        setFormData(prev => {
          // As requested, if the user records again, we completely overwrite 
          // the title and description with the latest recorded voice.
          return {
            ...prev,
            title: title,
            description: `🗣️ Original (Spoken):\n${translated.original}\n\n🇬🇧 English Translation:\n${translated.en}\n\n🇮🇳 Hindi Translation:\n${translated.hi}`
          };
        });
        setVoiceState('done');
      }, 600);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setVoiceState('idle');

      let errorMsg = 'An unknown microphone error occurred.';
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone access denied! Please click the camera/mic icon in your address bar and allow permission.';
      } else if (event.error === 'network') {
        errorMsg = 'Network error. Note: Web Speech API requires an active internet connection.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech was detected. Please verify your microphone is working and try again.';
      } else if (event.error === 'aborted') {
        errorMsg = 'Speech recognition was aborted unexpectedly.';
      }
      alert(errorMsg);
    };

    recognition.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const readFileAsDataUrl = (file) => new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mediaFiles.image) {
      alert("An image upload is required as proof for the authorities to verify this problem.");
      return;
    }
    if (!formData.title || !formData.description || !formData.location) return;

    setStep('analyzing');

    // Convert uploaded media files to Data URLs for instant preview & persistence
    const photoDataUrl = await readFileAsDataUrl(mediaFiles.image);
    const videoDataUrl = await readFileAsDataUrl(mediaFiles.video);
    const docDataUrl = await readFileAsDataUrl(mediaFiles.document);
    const voiceNoteUrl = voiceTranscript ? `Voice Note: ${voiceTranscript}` : null;

    setTimeout(() => {
      const fullText = formData.title + ' ' + formData.description;
      const domainResults = classifyDomain(fullText);
      const keywords = extractKeywords(fullText);
      const priority = computePriority(fullText);
      const duplicates = findDuplicates(formData.title, formData.description);
      const universities = matchUniversities(domainResults[0]?.domain || 'General');

      // Formulate final location with coordinates seamlessly for backend mapping
      const finalLocation = formData.location.includes('°N')
        ? formData.location
        : `${formData.location} (${currentCoords[0].toFixed(4)}°N, ${currentCoords[1].toFixed(4)}°E)`;

      const resultData = {
        id: 'YUKTI-' + Math.floor(9000 + Math.random() * 1000),
        domains: domainResults,
        keywords,
        priority,
        duplicates,
        universities,
        summary: formData.description.length > 120 ? formData.description.slice(0, 120) + '...' : formData.description,
        title: formData.title,
        location: finalLocation,
        submitterType: formData.submitterType,
        photo_url: photoDataUrl,
        video_url: videoDataUrl,
        document_url: docDataUrl,
        voice_url: voiceNoteUrl,
        hasPhoto: !!photoDataUrl,
        hasVideo: !!videoDataUrl,
        hasVoice: !!voiceNoteUrl,
        hasDocument: !!docDataUrl
      };
      setAnalysisResults(resultData);
      addProblem(resultData); // Persist globally in UI context

      // Save to backend database via FastAPI /api/problems endpoint
      const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('yukti_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      fetch('/api/problems', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          domain: domainResults[0]?.domain || 'General',
          subdomain: domainResults[0]?.subdomain || 'General',
          priority: priority.level.toLowerCase(),
          location_text: finalLocation,
          latitude: currentCoords[0],
          longitude: currentCoords[1],
          population_affected: '100+',
          photo_url: photoDataUrl,
          video_url: videoDataUrl,
          document_url: docDataUrl,
          voice_url: voiceNoteUrl
        })
      }).then(res => res.json()).then(data => {
        if (data && data.id) {
          resultData.db_id = data.id;
          console.log('Successfully saved problem to DB with media URLs:', data);
        }
      }).catch(err => console.warn('DB submit warning:', err));

      setStep('results');
    }, 800);
  };

  const handleReset = () => {
    setStep('form');
    setFormData({ title: '', description: '', location: '', category: '' });
    setMediaFiles({ image: null, video: null });
    setAnalysisResults(null);
    setDetectedLocation(false);
  };

  /* ──── ANALYZING SCREEN ──── */
  if (step === 'analyzing') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto animate-pulse">
            <Brain className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-mainText">AI is analyzing your problem...</h2>
        <div className="space-y-3 max-w-md mx-auto text-left">
          {[
            'Reading & preprocessing text...',
            'Classifying domain & subdomain...',
            'Computing priority score...',
            'Scanning for duplicate reports...',
            'Generating summary & keywords...',
            'Matching universities...',
          ].map((stage, i) => (
            <div key={i} className="flex items-center gap-3 text-sm" style={{ animationDelay: `${i * 0.3}s` }}>
              <Loader2 className="h-4 w-4 text-secondary animate-spin" />
              <span className="text-subText">{stage}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ──── RESULTS SCREEN ──── */
  if (step === 'results' && analysisResults) {
    const r = analysisResults;
    const prioColor = r.priority.level === 'Critical' ? 'text-red-600 bg-red-50 border-red-200'
      : r.priority.level === 'High' ? 'text-orange-600 bg-orange-50 border-orange-200'
        : r.priority.level === 'Medium' ? 'text-amber-600 bg-amber-50 border-amber-200'
          : 'text-blue-600 bg-blue-50 border-blue-200';
    const prioBarColor = r.priority.level === 'Critical' ? 'bg-red-500'
      : r.priority.level === 'High' ? 'bg-orange-500'
        : r.priority.level === 'Medium' ? 'bg-amber-500'
          : 'bg-blue-500';

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Success Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-4">
          <CheckCircle className="h-10 w-10 text-success flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-mainText">Problem Submitted & Analyzed</h2>
            <p className="text-sm text-subText">
              Assigned ID <span className="font-mono font-bold text-primary">{r.id}</span>. AI pipeline has processed your submission.
            </p>
          </div>
        </div>

        {/* Original Submission */}
        <div className="bg-card rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-mainText mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-secondary" /> Your Submission
          </h3>
          <p className="font-semibold text-mainText">{formData.title}</p>
          <p className="text-sm text-subText mt-1">{formData.description}</p>
          {formData.location && <p className="text-xs text-subText mt-2 flex items-center gap-1"><MapPin className="h-3 w-3" /> {formData.location}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Classification */}
          <div className="bg-card rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-mainText flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> AI Classification
            </h3>
            <div className="space-y-2">
              {r.domains.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-mainText">{d.domain}</span>
                      <span className="font-bold text-accent">{d.confidence}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-secondary to-accent transition-all duration-700"
                        style={{ width: `${d.confidence}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {r.domains[0] && (
              <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                <p className="font-semibold text-primary">Primary: {r.domains[0].domain}</p>
                <p className="text-subText text-xs">Subdomain: {r.domains[0].subdomain}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-subText mb-2 uppercase tracking-wider">Extracted Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {r.keywords.map((kw, i) => (
                  <span key={i} className="bg-slate-100 text-mainText text-xs font-medium px-2.5 py-1 rounded-md">{kw}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Score */}
          <div className="bg-card rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-mainText flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Priority Engine
            </h3>
            <div className="flex items-center gap-4">
              <div className={`text-3xl font-extrabold ${prioColor.split(' ')[0]}`}>{r.priority.score}/100</div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${prioColor}`}>{r.priority.level}</span>
            </div>
            {/* Score breakdown */}
            <div className="space-y-2.5">
              {[
                { label: 'Affected Population', pct: 30, val: r.priority.factors.affectedPopulation },
                { label: 'Severity', pct: 20, val: r.priority.factors.severity },
                { label: 'Urgency', pct: 20, val: r.priority.factors.urgency },
                { label: 'Geographic Spread', pct: 15, val: r.priority.factors.geographicSpread },
                { label: 'Govt Relevance', pct: 15, val: r.priority.factors.govRelevance },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-36 text-subText font-medium">{f.label} ({f.pct}%)</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${prioBarColor} rounded-full`} style={{ width: `${Math.min(100, f.val * 2)}%` }} />
                  </div>
                  <span className="font-bold text-mainText w-8 text-right">{Math.round(f.val * f.pct / 100)}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-bold text-mainText mb-1.5">Reasons:</p>
              <ul className="space-y-1">
                {r.priority.reasons.map((reason, i) => (
                  <li key={i} className="text-xs text-subText flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span> {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Duplicate Detection */}
        <div className="bg-card rounded-xl border border-slate-200 p-5 space-y-3">
          <h3 className="font-bold text-mainText flex items-center gap-2">
            <Copy className="h-4 w-4 text-primary" /> Duplicate Detection
          </h3>
          {r.duplicates.length > 0 ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-amber-800 font-medium">
                  {r.duplicates.length} potentially similar problem{r.duplicates.length > 1 ? 's' : ''} found. Admin will review for merging.
                </span>
              </div>
              <div className="space-y-2">
                {r.duplicates.map((dup, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <div className="flex-1">
                      <span className="font-mono text-xs text-primary font-bold">{dup.id}</span>
                      <p className="text-sm text-mainText font-medium">{dup.title}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${dup.similarity > 60 ? 'text-red-600' : dup.similarity > 40 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {dup.similarity}% similar
                      </div>
                      <div className="h-1.5 w-20 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full ${dup.similarity > 60 ? 'bg-red-500' : dup.similarity > 40 ? 'bg-amber-500' : 'bg-slate-400'}`}
                          style={{ width: `${dup.similarity}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-success font-medium">
              <CheckCircle className="h-4 w-4" /> No duplicates found — this appears to be a unique problem.
            </div>
          )}
        </div>

        {/* University Matching */}
        <div className="bg-card rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-mainText flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" /> University Matching — Recommended Institutions
          </h3>
          <p className="text-xs text-subText">
            Score = 40% Domain Expertise + 25% Faculty + 15% Past Projects + 10% Proximity + 10% Facilities
          </p>
          <div className="space-y-3">
            {r.universities.map((uni, i) => (
              <div key={i} className={`rounded-xl border p-4 ${i === 0 ? 'border-accent bg-teal-50/30' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold text-mainText">{i + 1}. {uni.name}</span>
                    <span className="text-xs text-subText ml-2">— {uni.dept}</span>
                  </div>
                  <span className={`text-lg font-extrabold ${i === 0 ? 'text-accent' : 'text-secondary'}`}>{uni.score}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${i === 0 ? 'bg-accent' : 'bg-secondary'}`}
                    style={{ width: `${uni.score}%` }} />
                </div>
                <div className="space-y-1">
                  {uni.reasons.map((reason, j) => (
                    <p key={j} className="text-xs text-subText flex items-start gap-1.5">
                      <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" /> {reason}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-primary rounded-xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">What happens next?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <Shield className="h-5 w-5 text-teal-300 mb-2" />
              <p className="font-semibold">Admin Verification</p>
              <p className="text-xs text-indigo-200 mt-1">A government officer will verify authenticity and check duplicates.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <GraduationCap className="h-5 w-5 text-teal-300 mb-2" />
              <p className="font-semibold">University Assignment</p>
              <p className="text-xs text-indigo-200 mt-1">The top-matched university will be invited to accept this challenge.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <Building className="h-5 w-5 text-teal-300 mb-2" />
              <p className="font-semibold">Industry Funding</p>
              <p className="text-xs text-indigo-200 mt-1">A CSR partner will be matched to fund or mentor the project.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={handleReset}
            className="flex-1 bg-secondary hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
            Submit Another Problem
          </button>
          <button onClick={() => navigate('/citizen')}
            className="flex-1 bg-card hover:bg-slate-50 border border-slate-200 text-mainText font-bold py-3 rounded-lg transition">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /* ──── FORM SCREEN ──── */
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-card rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-mainText mb-1">Report a Community Problem</h1>
        <p className="text-subText text-sm mb-6">
          Describe the problem in your own words. Our AI will automatically classify it, score the priority, check for duplicates, and match it to the best university.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ──── AI VOICE BOT ──── */}
          <div className="bg-white rounded-2xl border-2 border-indigo-100 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">AI Voice Assistant</h3>
                  <p className="text-indigo-100 text-xs">Report your problem simply by speaking (Auto-detects Hindi, English, & Dialects)</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center justify-center text-center space-y-6">

                {voiceState === 'idle' && (
                  <>
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="group relative flex flex-col items-center justify-center"
                    >
                      <div className="absolute -inset-4 bg-indigo-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-all">
                        <Mic className="h-8 w-8 text-white scale-100 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="relative mt-4 font-bold text-indigo-700">Tap to Speak</span>
                    </button>
                    <p className="text-sm text-subText max-w-sm">
                      Our AI will automatically translate your voice, extract the key issue, and fill in the details for you.
                    </p>
                  </>
                )}

                {voiceState === 'listening' && (
                  <div className="flex flex-col items-center space-y-5 w-full">
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="relative w-24 h-24 flex items-center justify-center"
                    >
                      <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75" />
                      <div className="absolute inset-2 bg-red-200 rounded-full animate-pulse" />
                      <div className="relative w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
                        <MicOff className="h-6 w-6" />
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="w-1.5 h-3 bg-red-500 rounded-full animate-[bounce_1s_infinite_100ms]" />
                        <span className="w-1.5 h-5 bg-red-500 rounded-full animate-[bounce_1s_infinite_200ms]" />
                        <span className="w-1.5 h-7 bg-red-500 rounded-full animate-[bounce_1s_infinite_300ms]" />
                        <span className="w-1.5 h-4 bg-red-500 rounded-full animate-[bounce_1s_infinite_400ms]" />
                        <span className="w-1.5 h-5 bg-red-500 rounded-full animate-[bounce_1s_infinite_500ms]" />
                      </span>
                      <span className="text-red-500 font-bold ml-2">Listening... (Tap to stop)</span>
                    </div>

                    {voiceTranscript && (
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2">
                        <p className="text-sm font-medium text-slate-700 italic">"{voiceTranscript}"</p>
                      </div>
                    )}
                  </div>
                )}

                {voiceState === 'processing' && (
                  <div className="flex flex-col items-center space-y-4 py-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                    <div>
                      <h4 className="font-bold text-mainText">AI is processing...</h4>
                      <p className="text-xs text-subText">Translating and identifying the core problem</p>
                    </div>
                  </div>
                )}

                {voiceState === 'done' && (
                  <div className="w-full space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-left">
                      <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-emerald-800">Voice captured successfully!</h4>
                        <p className="text-xs text-emerald-600 mb-2">The form description has been auto-filled.</p>

                        <div className="bg-white rounded-lg border border-emerald-100 p-3 mt-2 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Generated Title</p>
                          <p className="text-sm font-semibold text-slate-800">{aiGeneratedTitle}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setVoiceState('idle'); setVoiceTranscript(''); setAiGeneratedTitle(''); }}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2 mx-auto"
                    >
                      <Mic className="h-4 w-4" /> Try again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR TYPE IT MANUALLY</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-mainText mb-1.5">Problem Title</label>
            <input
              type="text" required
              placeholder="e.g., No proper drainage near our school"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-secondary text-mainText"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-mainText mb-1.5">Describe the Problem</label>
            <textarea
              rows={4} required
              placeholder="Describe what's happening, who is affected, and how long this has been going on..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-secondary text-mainText"
            />
            <p className="text-xs text-subText mt-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-accent" />
              Don't worry about categories — our AI will figure out the domain, urgency, and keywords automatically.
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-mainText mb-1.5">Location <span className="text-red-500 font-bold">*</span></label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text" required
                  placeholder="Village, City or District name"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 pl-10 rounded-lg border border-slate-300 focus:outline-none focus:border-secondary text-mainText"
                />
                <MapPin className="h-5 w-5 text-subText absolute left-3 top-2.5" />
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 border transition ${detectedLocation
                  ? 'bg-emerald-50 border-emerald-200 text-success'
                  : 'bg-indigo-50 border-indigo-200 text-primary hover:bg-indigo-100'
                  }`}
              >
                <Navigation className="h-4 w-4" />
                {detectedLocation ? 'Detected!' : 'Auto-detect'}
              </button>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 border transition ${showMap
                  ? 'bg-secondary text-white border-secondary'
                  : 'bg-slate-50 border-slate-200 text-mainText hover:bg-slate-100'
                  }`}
              >
                <MapPin className="h-4 w-4" />
                {showMap ? 'Hide Map' : 'Pick on Map'}
              </button>
            </div>

            {/* ──── JHARKHAND INTERACTIVE MAP ──── */}
            {showMap && (
              <div className="mt-3 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden relative" style={{ height: 350 }}>
                <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 10 }}></div>

                <div className="absolute bottom-4 left-4 z-[400] pointer-events-none hidden sm:block">
                  <div className="bg-black/70 backdrop-blur-md text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-xl border border-slate-600/50">
                    Tap anywhere on the satellite map to pin exact location
                  </div>
                </div>

                {detectedLocation && formData.location && (
                  <div className="absolute top-4 left-4 right-4 bg-emerald-500/90 backdrop-blur-sm text-white rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold flex items-center gap-2 z-[400] shadow-xl truncate">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Pinned: {formData.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Multimedia Evidence Upload */}
          <div>
            <label className="block text-sm font-semibold text-mainText mb-1.5">
              Multimedia Evidence <span className="text-red-500 font-bold">*</span>
            </label>
            <p className="text-xs text-subText mb-2">
              Provide photographic, video, or document evidence. For photos & videos, you can either <b>instantly record/capture</b> live or <b>upload from files</b>.
            </p>

            {/* Hidden File Inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { handleFileChange(e, 'image'); setPhotoOptionModal(false); }}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => { handleFileChange(e, 'video'); setVideoOptionModal(false); }}
            />
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFileChange(e, 'document')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* PHOTO EVIDECE CARD */}
              <div
                onClick={() => setPhotoOptionModal(true)}
                className={`border-2 border-dashed rounded-xl p-3.5 transition cursor-pointer text-center flex flex-col items-center justify-center space-y-1 ${
                  mediaFiles.image
                    ? 'border-indigo-500 bg-indigo-50/60 text-indigo-700'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Camera className={`h-6 w-6 ${mediaFiles.image ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold block truncate max-w-full">
                  {mediaFiles.image ? (typeof mediaFiles.image === 'string' ? '📷 Photo Captured!' : mediaFiles.image.name) : 'Primary Photo *'}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {mediaFiles.image ? 'Click to change' : 'Snap Camera OR Upload'}
                </span>
              </div>

              {/* VIDEO EVIDENCE CARD */}
              <div
                onClick={() => setVideoOptionModal(true)}
                className={`border-2 border-dashed rounded-xl p-3.5 transition cursor-pointer text-center flex flex-col items-center justify-center space-y-1 ${
                  mediaFiles.video
                    ? 'border-purple-500 bg-purple-50/60 text-purple-700'
                    : 'border-slate-300 hover:border-purple-400 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Video className={`h-6 w-6 ${mediaFiles.video ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold block truncate max-w-full">
                  {mediaFiles.video ? (typeof mediaFiles.video === 'string' ? '📹 Video Recorded!' : mediaFiles.video.name) : 'Attach Video'}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {mediaFiles.video ? 'Click to change' : 'Record Live OR Upload'}
                </span>
              </div>

              {/* DOCUMENT EVIDENCE CARD */}
              <div
                onClick={() => docInputRef.current && docInputRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-3.5 transition cursor-pointer text-center flex flex-col items-center justify-center space-y-1 ${
                  mediaFiles.document
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700'
                    : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <FileText className={`h-6 w-6 ${mediaFiles.document ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs font-bold block truncate max-w-full">
                  {mediaFiles.document ? mediaFiles.document.name : 'Attach Document'}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {mediaFiles.document ? 'Click to change' : 'PDF / DOC File'}
                </span>
              </div>
            </div>
          </div>

          {/* ──── PHOTO OPTION MODAL ──── */}
          {photoOptionModal && (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <Camera className="h-5 w-5 text-indigo-600" /> Primary Photo Option
                  </h3>
                  <button onClick={() => setPhotoOptionModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600">Choose how you want to provide your photo evidence:</p>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={startPhotoCamera}
                    className="w-full p-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-md hover:from-indigo-500 hover:to-blue-500 transition"
                  >
                    <Camera className="h-4 w-4" /> 📸 Instantly Take Photo (Web Camera)
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPhotoOptionModal(false); imageInputRef.current && imageInputRef.current.click(); }}
                    className="w-full p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition border border-slate-200"
                  >
                    <Upload className="h-4 w-4 text-slate-500" /> 📁 Upload Photo from Device / Gallery
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ──── VIDEO OPTION MODAL ──── */}
          {videoOptionModal && (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <Video className="h-5 w-5 text-purple-600" /> Video Evidence Option
                  </h3>
                  <button onClick={() => setVideoOptionModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600">Choose how you want to provide video recording proof:</p>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={startVideoCamera}
                    className="w-full p-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-md hover:from-purple-500 hover:to-indigo-500 transition"
                  >
                    <Radio className="h-4 w-4 text-rose-300 animate-pulse" /> 📹 Instantly Record Video (Camera)
                  </button>

                  <button
                    type="button"
                    onClick={() => { setVideoOptionModal(false); videoInputRef.current && videoInputRef.current.click(); }}
                    className="w-full p-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition border border-slate-200"
                  >
                    <Upload className="h-4 w-4 text-slate-500" /> 📁 Upload Video Clip from Device
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ──── LIVE CAMERA PHOTO SNAPSHOT STREAM MODAL ──── */}
          {showPhotoCamera && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 rounded-3xl max-w-md w-full p-5 space-y-4 border border-slate-700 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Camera className="h-4 w-4 text-indigo-400" /> Live Web Camera Stream
                  </h3>
                  <button onClick={stopPhotoCamera} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800">
                  <video ref={photoVideoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={stopPhotoCamera}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={capturePhotoSnap}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg"
                  >
                    <Camera className="h-4 w-4" /> Take Snap
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ──── LIVE VIDEO RECORDING STREAM MODAL ──── */}
          {showVideoCamera && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 rounded-3xl max-w-md w-full p-5 space-y-4 border border-slate-700 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-400" /> Live Video Recorder
                  </h3>
                  <button onClick={stopVideoCamera} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800">
                  <video ref={photoVideoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                  {isRecording && (
                    <div className="absolute top-3 left-3 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      Recording: {recordingTime}s
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={stopVideoCamera}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>

                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startVideoRecording}
                      className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg"
                    >
                      <Radio className="h-4 w-4 text-rose-300" /> Start Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVideoRecording}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg"
                    >
                      <Square className="h-4 w-4" /> Stop & Save Video
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submitter Type */}
          <div>
            <label className="block text-sm font-semibold text-mainText mb-1.5">Reporting On Behalf Of</label>
            <select
              value={formData.submitterType}
              onChange={(e) => setFormData({ ...formData, submitterType: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-secondary text-mainText bg-white cursor-pointer"
            >
              <option value="Individual">Individual Citizen</option>
              <option value="Community Group">Community Group</option>
              <option value="PRI">Panchayati Raj Institution (PRI)</option>
              <option value="ULB">Urban Local Body (ULB)</option>
              <option value="Gov Dept">Government Department</option>
            </select>
          </div>

          {/* Category (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-mainText mb-1.5">
              Category <span className="text-subText font-normal">(optional — AI will auto-detect)</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-secondary text-mainText bg-white"
            >
              <option value="">Let AI decide</option>
              <option>Education</option>
              <option>Healthcare</option>
              <option>Agriculture</option>
              <option>Water Management</option>
              <option>Environment</option>
              <option>Energy</option>
              <option>Sanitation</option>
              <option>Urban Infrastructure</option>
              <option>Accessibility</option>
              <option>Rural Livelihood</option>
            </select>
          </div>

          {/* Submit */}
          <button type="submit"
            className="w-full bg-secondary hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 text-base">
            Submit
          </button>
        </form>
      </div >
    </div >
  );
}