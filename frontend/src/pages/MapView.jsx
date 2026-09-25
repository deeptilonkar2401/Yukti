import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Filter, AlertTriangle, CheckCircle2, Clock, Globe } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useProblems } from '../context/ProblemContext';

export default function MapView() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { problems } = useProblems();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Helper to extract coordinates from location strings
  const getCoordinates = (loc) => {
    if (!loc) return [23.6102, 85.2799];
    if (typeof loc !== 'string') return [23.6102, 85.2799]; // Failsafe
    const match = loc.match(/\(([\d.-]+)°N, ([\d.-]+)°E\)/);
    if (match) return [parseFloat(match[1]), parseFloat(match[2])];

    // Quick approximations for mock data
    if (loc.toLowerCase().includes('ranchi') || loc.toLowerCase().includes('harmu')) return [23.3441, 85.3096];
    if (loc.toLowerCase().includes('palamu')) return [24.0371, 84.0679];
    if (loc.toLowerCase().includes('giridih')) return [24.1802, 86.3023];
    if (loc.toLowerCase().includes('dumka')) return [24.2693, 87.2514];
    if (loc.toLowerCase().includes('khunti')) return [23.0766, 85.2750];
    if (loc.toLowerCase().includes('latehar')) return [23.7431, 84.5036];
    if (loc.toLowerCase().includes('jamshedpur')) return [22.8046, 86.2029];
    if (loc.toLowerCase().includes('deoghar')) return [24.4842, 86.6974];

    // default center if unmapped
    return [23.6102, 85.2799];
  };

  const filteredPoints = selectedFilter === 'All'
    ? problems
    : problems.filter(p => (p.domain || p.category) === selectedFilter);

  // Vanilla Leaflet init
  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup old map if it exists
    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    // Initialize map
    const map = L.map(mapRef.current).setView([23.6102, 85.2799], 7.5);
    mapInstance.current = map;

    // Google Satellite Tiles
    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }).addTo(map);

    // Add markers
    filteredPoints.forEach(pt => {
      const coords = getCoordinates(pt.location || pt.loc);

      // Basic circle marker to avoid missing icon image errors
      const marker = L.circleMarker(coords, {
        radius: 8,
        fillColor: pt.status === 'Resolved' || pt.status === 'Deployed' ? '#10b981' : '#f59e0b',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map);

      // Popup
      marker.bindPopup(`
        <div style="font-family:sans-serif; padding:2px;">
          <h3 style="font-weight:bold; margin:0 0 5px 0;">${pt.title}</h3>
          <p style="margin:0; font-size:12px; color:#555;">📍 ${pt.location || pt.loc}</p>
          <span style="font-size:10px; font-weight:bold; color: #4338ca; margin-top:5px; display:inline-block;">[${pt.status}]</span>
        </div>
      `);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [filteredPoints]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mainText">Jharkhand Problem Map</h1>
          <p className="text-subText text-sm">Real-time status of community challenges mapped across Jharkhand districts.</p>
        </div>
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-lg border border-slate-200">
          <Filter className="h-4 w-4 text-subText ml-2" />
          {['All', 'Water', 'Sanitation', 'Agriculture', 'Healthcare', 'Energy', 'Education'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${selectedFilter === cat ? 'bg-primary text-white' : 'text-subText hover:text-mainText'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container — Vanilla Leaflet Satellite */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl relative overflow-hidden border border-slate-300 shadow-lg" style={{ height: '550px' }}>

          <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 10 }}></div>

          {/* State label */}
          <div className="absolute top-4 left-14 z-[400] pointer-events-none bg-black/50 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700/50 hidden sm:block">
            <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Globe className="h-3 w-3 text-secondary" /> Jharkhand Live Map (Google Satellite)
            </span>
          </div>
        </div>

        {/* Sidebar Listing */}
        <div className="space-y-4">
          <h2 className="font-bold text-mainText text-lg">Active Problems ({filteredPoints.length})</h2>
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredPoints.map((item) => (
              <div key={item.id} className="bg-card p-4 rounded-xl border border-slate-200 shadow-sm hover:border-secondary transition">
                <div className="flex justify-between items-start gap-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{item.domain || item.category}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.status === 'Resolved' || item.status === 'Deployed' ? 'bg-emerald-100 text-emerald-800' :
                    item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>{item.status}</span>
                </div>
                <h3 className="font-bold text-mainText text-sm mt-2">{item.title}</h3>
                <p className="text-xs text-subText flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {item.location || item.loc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}