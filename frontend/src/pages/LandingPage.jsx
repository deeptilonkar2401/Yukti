import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search, Users, HeartHandshake, Lightbulb, TrendingUp,
  Map as MapIcon, ShieldCheck, Cog, BarChart,
  GraduationCap, Building, Flag, ArrowRight, Activity, Globe, MapPin,
  MoreHorizontal, ChevronRight, CheckCircle2, ChevronDown
} from 'lucide-react';

const COLORS = {
  primary: '#1E40AF', // Blue
  secondary: '#0F766E', // Green/Teal
  textDark: '#0F172A',
  textLight: '#475569',
  bgLight: '#F8FAFC'
};

export default function LandingPage({ onLogin, onSignup }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => navigate('/login');
  const handleSignup = () => navigate('/signup');

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* ===== NAVBAR ===== */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo-transparent.png" alt="YUKTI" className="h-14 w-auto drop-shadow-sm" />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight" style={{ color: COLORS.primary }}>YUKTI</span>
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:block leading-tight">
                  Youth for Unified Knowledge<br />Transformation & Innovation
                </span>
              </div>
            </div>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-sm font-bold border-b-2 border-teal-700 text-teal-800 pb-1">Home</Link>
              <Link to="/citizen" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Explore Problems</Link>
              <a href="#" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Impact</a>
              <a href="#" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Partners</a>
              <a href="#" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">About</a>
            </div>

            {/* Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <button className="text-slate-500 hover:text-slate-900"><Search className="h-5 w-5" /></button>
              <button onClick={handleLogin} className="text-sm font-semibold text-slate-700 bg-white border border-slate-300 px-5 py-2 rounded-full hover:bg-slate-50 transition-colors">
                Login
              </button>
              <button onClick={handleSignup} className="text-sm font-bold text-white bg-slate-900 px-5 py-2 rounded-full hover:bg-slate-800 transition-colors">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <div className="space-y-1.5">
                <div className="w-6 h-0.5 bg-slate-800"></div>
                <div className="w-6 h-0.5 bg-slate-800"></div>
                <div className="w-6 h-0.5 bg-slate-800"></div>
              </div>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden px-6 py-4 bg-white border-b border-slate-100 flex flex-col gap-4 shadow-lg absolute w-full">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-bold text-teal-800">Home</Link>
            <Link to="/citizen" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-600">Explore Problems</Link>
            <a href="#" className="font-semibold text-slate-600">How It Works</a>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mt-2 text-left font-bold border border-slate-200 p-2 rounded text-center block">Login</Link>
            <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-left font-bold bg-slate-900 text-white p-2 rounded text-center block">Get Started</Link>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden pb-12 pt-12 lg:pt-20 bg-slate-100">
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          {/* Blurred Background Image */}
          <img
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60 blur-xl scale-110"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

            {/* Left Content */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left animate-fade-in-up">
              <h1 className="text-5xl tracking-tight font-extrabold sm:text-6xl md:text-7xl">
                <span className="block mb-2" style={{ color: COLORS.primary, textShadow: '0 4px 20px rgba(30,64,175,0.15)' }}>YUKTI</span>
                <span className="block text-slate-900 mb-2 drop-shadow-sm">From Societal <span style={{ color: COLORS.secondary }}>Problems</span></span>
                <span className="block text-slate-900 drop-shadow-sm">to Real-World <span style={{ color: COLORS.secondary }}>Solutions.</span></span>
              </h1>
              <p className="mt-6 text-base text-slate-600 sm:mt-8 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-8 md:text-xl lg:mx-0 font-medium">
                A national platform that connects citizens, universities, industry and government to turn real problems into innovative solutions.
              </p>

              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
                <Link to={user ? "/submit" : "/login?redirect=/submit"} className="px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-lg shadow-teal-500/30 flex justify-center items-center">
                  Report a Problem
                </Link>
                <Link to={user ? "/citizen" : "/login?redirect=/citizen"} className="px-8 py-3.5 border-2 border-slate-200 text-base font-bold rounded-full text-slate-700 bg-white hover:bg-slate-50 transition-colors flex justify-center items-center shadow-sm">
                  Explore Problems
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-5 w-5 text-teal-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Real People<br />Real Problems</p>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-2 mb-1">
                    <Cog className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">AI-Powered<br />Matching</p>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-2 mb-1">
                    <HeartHandshake className="h-5 w-5 text-indigo-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Collaborative<br />Innovation</p>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Measurable<br />Impact</p>
                </div>
              </div>
            </div>

            {/* Right Image area */}
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden animate-fade-in-up-d2">
                <div className="relative block w-full h-[500px] bg-slate-100">
                  {/* Background Image Placeholder using a generic unpslash image of a child/community */}
                  <img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80" alt="Student looking at future" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 mix-blend-multiply" />

                  {/* Floating Hand-drawn Text Overlay */}
                  <div className="absolute top-8 right-8 text-right rotate-[-5deg]">
                    <p className="text-2xl font-bold text-white drop-shadow-md font-serif italic">Ideas<br />today</p>
                    <p className="text-4xl font-extrabold text-teal-400 drop-shadow-lg font-serif italic mt-1">A better<br />tomorrow</p>
                  </div>

                  {/* Quote card */}
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 backdrop-blur pb-3 pt-4 px-5 rounded-2xl shadow-xl max-w-[220px]">
                    <p className="text-sm font-bold text-slate-800 italic leading-snug">"A problem shared is a solution invited."</p>
                    <p className="text-[10px] font-bold text-teal-700 mt-2 tracking-widest uppercase">— YUKTI</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== THE PROBLEM WE SOLVE / LIVE MAP ===== */}
      <section className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12">

            {/* Left: The Problem We Solve */}
            <div className="lg:col-span-7 space-y-8 animate-fade-in-up">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">The Problem We Solve</h2>
                <p className="mt-3 text-lg text-slate-600 max-w-2xl font-medium">
                  Real problems exist everywhere, but the right problem often fails to reach the right people.
                </p>
              </div>

              <div className="relative">
                {/* Connecting Lines (visual only, simplified for representation) */}
                <div className="absolute top-24 left-16 right-16 h-12 border-b-2 border-l-2 border-r-2 border-teal-200 rounded-b-xl z-0 hidden md:block"></div>
                <div className="absolute top-36 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-teal-200 z-0 hidden md:block"></div>

                <div className="grid md:grid-cols-3 gap-6 relative z-10">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4 text-green-700">
                      <Users size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Citizens</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">See real problems in their communities but lack the right channel to report them.</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-700">
                      <GraduationCap size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Universities</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">Have talent, research and expertise but limited access to real-world challenges.</p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 text-purple-700">
                      <Building size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Industry</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">Has resources, technology and mentorship but needs a structured way to support meaningful innovations.</p>
                  </div>
                </div>

                <div className="mt-16 text-center relative z-10">
                  <div className="inline-block bg-teal-700 text-white font-black text-xl px-10 py-3 rounded-full shadow-lg shadow-teal-500/20 mx-auto">
                    YUKTI
                  </div>
                  <p className="mt-4 text-sm font-bold text-slate-600 max-w-sm mx-auto leading-relaxed">
                    YUKTI connects them for a stronger, smarter and more innovative tomorrow.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Live Map & Quote */}
            <div className="lg:col-span-5 space-y-6 animate-fade-in-up-d2">
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <p className="text-base font-bold text-green-800 leading-relaxed text-center">
                  "Empowering people,<br />enabling solutions,<br />strengthening India."
                </p>
                <div className="w-8 h-1 bg-green-500 mx-auto mt-4 rounded-full"></div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Live Problem Map</h3>
                    <p className="text-xs font-semibold text-slate-500">Explore real challenges from across India</p>
                  </div>
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                    All Domains <ChevronDown size={14} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  {/* Schematic Map Placeholder */}
                  <div className="flex-1 relative aspect-square max-w-[200px] w-full bg-slate-50 rounded-xl flex items-center justify-center p-4">
                    <Globe className="w-full h-full text-slate-200" strokeWidth={1} />
                    {/* Pseudo Map Pins */}
                    <MapPin className="absolute top-[30%] left-[40%] text-blue-500 w-4 h-4" />
                    <MapPin className="absolute top-[45%] left-[60%] text-red-500 w-5 h-5 bg-white rounded-full" />
                    <MapPin className="absolute top-[60%] left-[35%] text-amber-500 w-4 h-4" />
                    <MapPin className="absolute top-[80%] left-[50%] text-teal-500 w-4 h-4" />
                    <MapPin className="absolute top-[50%] left-[20%] text-purple-500 w-4 h-4" />
                    <p className="absolute bottom-2 text-[8px] text-slate-400">Click on a state to view challenges</p>
                  </div>

                  {/* Stats List */}
                  <div className="w-full sm:w-48 space-y-2.5">
                    {[
                      { icon: GraduationCap, color: 'text-purple-600 bg-purple-100', name: 'Education', count: 120 },
                      { icon: Activity, color: 'text-red-600 bg-red-100', name: 'Healthcare', count: 95 },
                      { icon: Globe, color: 'text-green-600 bg-green-100', name: 'Agriculture', count: 88 },
                      { icon: MapIcon, color: 'text-blue-600 bg-blue-100', name: 'Water Mgmt', count: 76 },
                      { icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-100', name: 'Sanitation', count: 60 }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-full ${item.color}`}>
                            <item.icon size={10} />
                          </div>
                          <span className="font-bold text-slate-700">{item.name}</span>
                        </div>
                        <span className="font-exrabold text-slate-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== HOW YUKTI WORKS ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-7">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">How YUKTI Works</h2>
              <p className="text-lg text-slate-600 font-medium mb-12">A simple yet powerful journey from problem to impact.</p>

              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-2 relative">
                {/* Horizontal line */}
                <div className="absolute top-8 left-10 right-10 h-0.5 bg-slate-100 z-0 hidden sm:block"></div>

                {[
                  { num: 1, title: 'Report', desc: 'Citizens submit problems (text, voice, image, video, location)', icon: '📝', color: 'bg-emerald-500' },
                  { num: 2, title: 'AI Understands', desc: 'AI categorizes, prioritizes and checks for duplicates', icon: '🧠', color: 'bg-blue-500' },
                  { num: 3, title: 'Match', desc: 'Connects with the right universities and experts', icon: '🫂', color: 'bg-purple-500' },
                  { num: 4, title: 'Collaborate', desc: 'Students, industry and government work together', icon: '⚙️', color: 'bg-amber-500' },
                  { num: 5, title: 'Impact', desc: 'Solutions are developed, tested and deployed for real change', icon: '📈', color: 'bg-teal-600' }
                ].map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center text-center w-full sm:w-1/5">
                    <div className={`w-16 h-16 rounded-3xl ${step.color} text-white flex items-center justify-center text-2xl shadow-lg mb-4 hover:-translate-y-1 transition-transform cursor-pointer`}>
                      {step.icon}
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{step.num}. {step.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-snug font-medium px-1">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">Demo</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">See AI in Action</h3>
                <p className="text-xs text-slate-600 font-medium mb-4">Try a real example of problem classification</p>

                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-slate-800 font-serif">"हमारे गाँव में पानी की टंकी बार-बार खाली हो जाती है।"</p>
                </div>

                <button className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg mb-4 hover:bg-slate-900 transition-colors">
                  Process with AI
                </button>

                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-700 w-24">Category:</span>
                    <span className="text-xs font-semibold text-slate-900">Water Management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Flag className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-bold text-slate-700 w-24">Priority:</span>
                    <span className="text-xs font-semibold text-slate-900">High</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-700 w-24">Location:</span>
                    <span className="text-xs font-semibold text-slate-900">Village X, Madhya Pradesh</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Cog className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-700 w-24">Required Expertise:</span>
                    <span className="text-xs font-semibold text-slate-900">IoT, Water Engineering</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== FEATURED CHALLENGES & IMPACT ===== */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Featured Challenges</h2>
              <p className="text-base text-slate-600 font-medium">Explore some of the real problems reported on YUKTI.</p>
            </div>
            <Link to={user ? "/citizen" : "/login?redirect=/citizen"} className="text-sm font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 group">
              View All Challenges <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">

            {/* Cards */}
            {[
              {
                img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80',
                priority: 'High Priority', pColor: 'bg-red-100 text-red-700',
                title: 'Rural Mathematics Learning Gap',
                loc: 'Ranchi, Jharkhand',
                cat: 'Education',
                status: 'University Matching', sColor: 'bg-blue-100 text-blue-700'
              },
              {
                img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80',
                priority: 'Active', pColor: 'bg-amber-100 text-amber-700',
                title: 'Irregular Water Supply in Village',
                loc: 'Dumka, Jharkhand',
                cat: 'Water Management',
                status: 'Under Validation', sColor: 'bg-amber-100 text-amber-700'
              },
              {
                img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80',
                priority: 'Active', pColor: 'bg-amber-100 text-amber-700',
                title: 'Low Crop Yield Due to Soil Degradation',
                loc: 'Hazaribagh, Jharkhand',
                cat: 'Agriculture',
                status: 'Solution Development', sColor: 'bg-emerald-100 text-emerald-700'
              },
              {
                img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80',
                priority: 'Solved', pColor: 'bg-teal-100 text-teal-700',
                title: 'Waste Collection Optimization',
                loc: 'Deoghar, Jharkhand',
                cat: 'Sanitation',
                status: 'Deployed', sColor: 'bg-teal-100 text-teal-700'
              }
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col group cursor-pointer">
                <div className="h-40 overflow-hidden relative">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className={`absolute bottom-3 left-3 px-2.5 py-1 text-[10px] font-bold rounded-lg ${card.pColor} shadow-sm backdrop-blur-md bg-opacity-90`}>
                    {card.priority}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-bold text-slate-900 text-sm mb-3 line-clamp-2 leading-snug">{card.title}</h4>

                  <div className="mt-auto space-y-2 mb-4 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> <span>{card.loc}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" /> <span>{card.cat}</span>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold w-fit ${card.sColor} flex items-center gap-1.5`}>
                    <Cog className="w-3.5 h-3.5" /> {card.status}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Impact Stats Row next to cards on large screens (implemented as a below section due to space, matching design flow) */}
          <div className="mt-16 border-t border-slate-200 pt-16 grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Impact at a Glance</h3>
              <p className="text-sm font-medium text-slate-600 mb-6">YUKTI is building India's largest repository of community-driven innovation.</p>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { v: '2,840+', l: 'Problems Reported', i: Activity, c: 'text-blue-500' },
                { v: '1,920', l: 'Verified Problems', i: CheckCircle2, c: 'text-emerald-500' },
                { v: '340', l: 'University Teams', i: GraduationCap, c: 'text-purple-500' },
                { v: '87', l: 'Industry Partners', i: Building, c: 'text-amber-500' },
                { v: '126', l: 'Solutions Developed', i: Lightbulb, c: 'text-rose-500' },
                { v: '42', l: 'Solutions Deployed', i: TrendingUp, c: 'text-teal-500' }
              ].map((s, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
                  <s.i className={`w-6 h-6 ${s.c} mb-2`} />
                  <div className="text-xl font-extrabold text-slate-900">{s.v}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ===== WHO IS YUKTI FOR? ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8">

            {/* Roles */}
            <div className="lg:col-span-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Who is YUKTI For?</h2>

              <div className="grid sm:grid-cols-2 gap-6">

                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl hover:border-teal-200 transition-colors group">
                  <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Citizens</h3>
                  <p className="text-sm font-medium text-slate-600">Report problems and be part of the change.</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl hover:border-blue-200 transition-colors group">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Students & Universities</h3>
                  <p className="text-sm font-medium text-slate-600">Work on real-world challenges and create innovative solutions.</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl hover:border-purple-200 transition-colors group">
                  <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Building size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Industry</h3>
                  <p className="text-sm font-medium text-slate-600">Provide expertise, resources and support.</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl hover:border-amber-200 transition-colors group">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Flag size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Government</h3>
                  <p className="text-sm font-medium text-slate-600">Monitor progress and enable large-scale deployment.</p>
                </div>

              </div>
            </div>

            {/* CTA Box */}
            <div className="lg:col-span-4">
              <div className="h-full bg-slate-900 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0F172A 0%, #064E3B 100%)' }}>
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-teal-300 text-[10px] font-black uppercase tracking-wider w-fit mb-6">
                  <HeartHandshake className="w-3.5 h-3.5" /> Be the Change
                </div>

                <h3 className="text-3xl font-extrabold text-white leading-tight mb-4">
                  Have a problem?<br />Turn it into an opportunity for innovation.
                </h3>

                <Link to={user ? "/submit" : "/login?redirect=/submit"} className="mt-8 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-6 py-3.5 rounded-full flex items-center justify-center gap-2 transition-colors w-full sm:w-auto shadow-lg shadow-teal-500/25">
                  Report a Problem <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <div className="flex items-center gap-3">
              <img src="/logo-transparent.png" alt="YUKTI" className="h-12 w-auto opacity-90 hover:opacity-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] transition-all" />
              <div className="flex flex-col text-slate-500">
                <span className="text-lg font-extrabold tracking-tight">YUKTI</span>
                <span className="text-[8px] font-bold uppercase tracking-wider leading-tight">
                  Youth for Unified Knowledge<br />Transformation & Innovation
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-500">
              Innovating for a Better, Stronger, Inclusive India.
            </p>

            <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
              <a href="#" className="hover:text-slate-900">About</a>
              <a href="#" className="hover:text-slate-900">Contact</a>
              <a href="#" className="hover:text-slate-900">Privacy</a>
              <a href="#" className="hover:text-slate-900">Terms</a>
              <div className="flex items-center gap-4 ml-4">
                {/* Social placeholers */}
                <div className="w-5 h-5 bg-slate-300 rounded-sm"></div>
                <div className="w-5 h-5 bg-slate-300 rounded-sm"></div>
                <div className="w-5 h-5 bg-slate-300 rounded-sm"></div>
              </div>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
