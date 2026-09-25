import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Lightbulb, Search, ArrowRight, Users, Cpu, GraduationCap, Building2,
  Award, CheckCircle2, Sparkles, MapPin, Landmark, Droplet, Sprout,
  Trash2, TrendingUp, Linkedin, Youtube, X as XIcon
} from 'lucide-react';

const domainCounts = [
  { label: 'Education', count: 120, color: 'bg-indigo-500' },
  { label: 'Healthcare', count: 95, color: 'bg-red-500' },
  { label: 'Agriculture', count: 88, color: 'bg-lime-600' },
  { label: 'Water Management', count: 76, color: 'bg-blue-500' },
  { label: 'Sanitation', count: 60, color: 'bg-amber-500' },
  { label: 'Environment', count: 54, color: 'bg-green-600' },
  { label: 'Rural Livelihoods', count: 43, color: 'bg-orange-500' },
  { label: 'Accessibility', count: 32, color: 'bg-yellow-500' },
  { label: 'Urban Infrastructure', count: 71, color: 'bg-slate-500' },
  { label: 'Public Service Delivery', count: 49, color: 'bg-rose-500' },
];

const pipelineSteps = [
  { title: '1. Report', desc: 'Citizens submit problems (text, voice, image, video, location)', icon: CheckCircle2, bg: 'bg-emerald-500' },
  { title: '2. AI Understands', desc: 'AI categorizes, prioritizes and checks for duplicates', icon: Cpu, bg: 'bg-sky-500' },
  { title: '3. Match', desc: 'Connects with the right universities and experts', icon: Users, bg: 'bg-violet-500' },
  { title: '4. Collaborate', desc: 'Students, industry and government work together', icon: Sparkles, bg: 'bg-amber-500' },
  { title: '5. Impact', desc: 'Solutions are developed, tested and deployed for real change', icon: TrendingUp, bg: 'bg-emerald-500' },
];

const featuredChallenges = [
  {
    title: 'Rural Mathematics Learning Gap',
    location: 'Ranchi, Jharkhand',
    category: 'Education',
    status: 'High Priority',
    statusColor: 'bg-red-100 text-red-700',
    tag: 'University Matching',
    tagColor: 'bg-indigo-100 text-indigo-700',
    icon: GraduationCap,
    grad: 'from-indigo-200 to-indigo-50',
  },
  {
    title: 'Irregular Water Supply in Village',
    location: 'Dumka, Jharkhand',
    category: 'Water Management',
    status: 'Active',
    statusColor: 'bg-amber-100 text-amber-700',
    tag: 'Under Validation',
    tagColor: 'bg-amber-100 text-amber-700',
    icon: Droplet,
    grad: 'from-sky-200 to-sky-50',
  },
  {
    title: 'Low Crop Yield Due to Soil Degradation',
    location: 'Hazaribagh, Jharkhand',
    category: 'Agriculture',
    status: 'Active',
    statusColor: 'bg-amber-100 text-amber-700',
    tag: 'Solution Development',
    tagColor: 'bg-blue-100 text-blue-700',
    icon: Sprout,
    grad: 'from-lime-200 to-lime-50',
  },
  {
    title: 'Waste Collection Optimization',
    location: 'Deoghar, Jharkhand',
    category: 'Sanitation',
    status: 'Solved',
    statusColor: 'bg-emerald-100 text-emerald-700',
    tag: 'Deployed',
    tagColor: 'bg-emerald-100 text-emerald-700',
    icon: Trash2,
    grad: 'from-emerald-200 to-emerald-50',
  },
];

const audiences = [
  { title: 'Citizens', desc: 'Report problems and be part of the change.', icon: Users },
  { title: 'Students & Universities', desc: 'Work on real-world challenges and create innovative solutions.', icon: GraduationCap },
  { title: 'Industry', desc: 'Provide expertise, resources and support.', icon: Building2 },
  { title: 'Government', desc: 'Monitor progress and enable large-scale deployment.', icon: Landmark },
];

function Logo({ light }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
        <Lightbulb className="h-5 w-5 text-emerald-500" />
      </div>
      <div className="leading-tight">
        <p className={`font-extrabold tracking-tight ${light ? 'text-white' : 'text-primary'}`}>YUKTI</p>
        <p className={`text-[10px] ${light ? 'text-indigo-200' : 'text-subText'}`}>
          Youth for Unified Knowledge<br />Transformation &amp; Innovation
        </p>
      </div>
    </Link>
  );
}

function Header() {
  const navItems = [
    { label: 'Home', href: '#top' },
    { label: 'Explore Problems', href: '#featured' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Impact', href: '#impact' },
    { label: 'Partners', href: '#who-for' },
    { label: 'About', href: '#top' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Logo />
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-subText">
          {navItems.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className={i === 0 ? 'text-emerald-600 border-b-2 border-emerald-600 pb-1' : 'hover:text-mainText transition'}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex p-2 text-subText hover:text-mainText" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <Link
            to="/login"
            className="hidden sm:inline-block border border-slate-300 text-mainText font-semibold text-sm px-4 py-2 rounded-lg hover:bg-slate-50 transition"
          >
            Login
          </Link>
          <Link
            to="/login"
            className="bg-primary hover:bg-indigo-900 text-white font-semibold text-sm px-4 py-2 rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-auto rounded-2xl" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <rect width="500" height="400" fill="url(#skyGrad)" />
      <circle cx="380" cy="90" r="45" fill="#fde68a" />
      <path d="M0 260 Q 130 180 260 250 T 500 230 V400 H0 Z" fill="url(#hillGrad)" />
      <path d="M0 300 Q 150 240 300 290 T 500 280 V400 H0 Z" fill="#22c55e" opacity="0.8" />
      <g transform="translate(360,150)">
        <rect x="0" y="0" width="120" height="70" rx="4" fill="#f5f5f4" stroke="#78716c" strokeWidth="2" />
        <text x="60" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">BETTER</text>
        <text x="60" y="40" textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">COMMUNITIES</text>
        <text x="60" y="58" textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">BRIGHTER FUTURES</text>
        <rect x="55" y="70" width="10" height="35" fill="#78716c" />
      </g>
      <g transform="translate(190,190)">
        <circle cx="30" cy="18" r="16" fill="#8d5524" />
        <path d="M8 26 q22 -10 44 0 l6 90 q-28 14 -56 0 z" fill="#1e293b" />
        <rect x="10" y="34" width="34" height="46" rx="8" fill="#334155" />
        <path d="M2 60 q28 30 56 0" stroke="#0f172a" strokeWidth="4" fill="none" />
      </g>
    </svg>
  );
}

function Hero() {
  return (
    <section id="top" className="bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-primary font-extrabold text-2xl tracking-tight mb-1">YUKTI</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-mainText leading-tight">
            From Societal <span className="text-emerald-600">Problems</span><br />
            to Real-World <span className="text-emerald-600">Solutions.</span>
          </h1>
          <p className="text-subText text-lg mt-5 max-w-xl">
            A national platform that connects citizens, universities, industry and government to turn
            real problems into innovative solutions.
          </p>
          <div className="flex flex-wrap gap-4 mt-7">
            <Link
              to="/submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition"
            >
              Report a Problem
            </Link>
            <Link
              to="/map"
              className="border border-slate-300 text-mainText font-bold px-6 py-3 rounded-lg hover:bg-slate-50 transition"
            >
              Explore Problems
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {[
              { label: 'Real People\nReal Problems', icon: Users },
              { label: 'AI-Powered\nMatching', icon: Cpu },
              { label: 'Collaborative\nInnovation', icon: Sparkles },
              { label: 'Measurable\nImpact', icon: CheckCircle2 },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-2">
                <f.icon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-subText whitespace-pre-line leading-snug">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <HeroIllustration />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow text-sm italic text-mainText max-w-[220px]">
            "A problem shared is a solution invited."
            <span className="block not-italic text-xs text-subText mt-1">— YUKTI</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemWeSolve() {
  const cards = [
    { title: 'Citizens', desc: 'See real problems in their communities but lack the right channel to report them.', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Universities', desc: 'Have talent, research and expertise but limited access to real-world challenges.', icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Industry', desc: 'Has resources, technology and mentorship but needs a structured way to support meaningful innovations.', icon: Building2, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold text-mainText">The Problem We Solve</h2>
          <p className="text-subText mt-2 max-w-xl">
            Real problems exist everywhere, but the right problem often fails to reach the right people.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 text-sm text-emerald-800">
          "Empowering people, enabling solutions, strengthening India."
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {cards.map((c) => (
          <div key={c.title} className="bg-card border border-slate-200 rounded-xl p-6">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-mainText mb-1">{c.title}</h3>
            <p className="text-sm text-subText">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center mt-6 gap-3">
        <span className="bg-emerald-600 text-white text-sm font-semibold px-6 py-2 rounded-full">YUKTI</span>
        <p className="text-sm text-subText text-center">
          YUKTI connects them for a stronger, smarter and more innovative tomorrow.
        </p>
      </div>
    </section>
  );
}

function LiveProblemMap() {
  return (
    <section className="bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-card border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-mainText">Live Problem Map</h3>
            <select className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 text-subText">
              <option>All Domains</option>
            </select>
          </div>
          <div className="bg-sky-50 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
            <MapPin className="h-10 w-10 text-primary opacity-20 absolute" />
            <div className="grid grid-cols-6 gap-3 relative">
              {domainCounts.slice(0, 12).map((d, i) => (
                <span key={i} className={`h-3 w-3 rounded-full ${d.color}`} />
              ))}
            </div>
          </div>
          <p className="text-xs text-subText text-center mt-3">Click on a state to view challenges</p>
        </div>

        <div className="lg:col-span-2 bg-card border border-slate-200 rounded-xl p-6 space-y-2.5">
          {domainCounts.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-mainText">
                <span className={`h-2.5 w-2.5 rounded-full ${d.color}`} />
                {d.label}
              </span>
              <span className="font-semibold text-subText">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const [showResult, setShowResult] = useState(false);

  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h2 className="text-3xl font-bold text-mainText">How YUKTI Works</h2>
      <p className="text-subText mt-2 mb-10 max-w-xl">
        A simple yet powerful journey from problem to impact.
      </p>

      <div className="grid lg:grid-cols-5 gap-10 items-start">
        <div className="lg:col-span-3 grid grid-cols-5 gap-2">
          {pipelineSteps.map((step) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white mb-3 ${step.bg}`}>
                <step.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-sm text-mainText">{step.title}</p>
              <p className="text-xs text-subText mt-1 leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 bg-card border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-mainText">See AI in Action</h4>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Demo</span>
          </div>
          <p className="text-xs text-subText mb-3">Try a real example of problem classification</p>
          <div className="border border-slate-200 rounded-lg p-3 text-sm text-mainText bg-slate-50 mb-3">
            "हमारे गाँव में पानी की टंकी बार-बार खाली हो जाती है।"
          </div>
          <button
            onClick={() => setShowResult(true)}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-lg transition"
          >
            Process with AI
          </button>

          {showResult && (
            <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-lg p-4 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-mainText"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Category: Water Management</p>
              <p className="flex items-center gap-2 text-mainText"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Priority: High</p>
              <p className="flex items-center gap-2 text-mainText"><MapPin className="h-4 w-4 text-emerald-600" /> Location: Village X, Madhya Pradesh</p>
              <p className="flex items-center gap-2 text-mainText"><Cpu className="h-4 w-4 text-emerald-600" /> Required Expertise: IoT, Water Engineering</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturedChallenges() {
  return (
    <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold text-mainText">Featured Challenges</h2>
        <Link to="/map" className="text-secondary text-sm font-semibold hover:underline flex items-center gap-1">
          View All Challenges <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="text-subText mb-8">Explore some of the real problems reported on YUKTI.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredChallenges.map((c) => (
          <div key={c.title} className="bg-card border border-slate-200 rounded-xl overflow-hidden">
            <div className={`h-28 bg-gradient-to-br ${c.grad} flex items-center justify-center relative`}>
              <c.icon className="h-9 w-9 text-mainText/40" />
              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.statusColor}`}>
                {c.status}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-sm text-mainText mb-1">{c.title}</h3>
              <p className="text-xs text-subText flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" /> {c.location}
              </p>
              <p className="text-xs text-subText mb-3">{c.category}</p>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${c.tagColor}`}>{c.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ImpactAndCTA() {
  const stats = [
    { label: 'Problems Reported', value: '2,840+', icon: Users },
    { label: 'Verified Problems', value: '1,920', icon: CheckCircle2 },
    { label: 'University Teams', value: '340', icon: GraduationCap },
    { label: 'Industry Partners', value: '87', icon: Building2 },
    { label: 'Solutions Developed', value: '126', icon: Lightbulb },
    { label: 'Solutions Deployed', value: '42', icon: TrendingUp },
  ];

  return (
    <section id="impact" className="bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-mainText mb-6">Impact at a Glance</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 text-primary flex items-center justify-center flex-shrink-0">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-mainText leading-none">{s.value}</p>
                  <p className="text-xs text-subText mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-xl p-8 flex flex-col justify-center">
          <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-200 mb-3">Be the Change</span>
          <h3 className="text-2xl font-bold mb-6 leading-snug">
            Have a problem? Turn it into an opportunity for innovation.
          </h3>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-5 py-3 rounded-lg w-fit hover:bg-emerald-50 transition"
          >
            Report a Problem <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhoIsYuktiFor() {
  return (
    <section id="who-for" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h2 className="text-2xl font-bold text-mainText mb-8">Who is YUKTI For?</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {audiences.map((a) => (
          <div key={a.title} className="bg-card border border-slate-200 rounded-xl p-6">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 text-primary flex items-center justify-center mb-4">
              <a.icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-mainText mb-1">{a.title}</h3>
            <p className="text-sm text-subText">{a.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo light />
        <p className="text-sm text-slate-400 text-center">
          Innovating for a Better, Stronger, Inclusive India.
        </p>
        <div className="flex items-center gap-5 text-sm">
          <a href="#top" className="hover:text-white">About</a>
          <a href="#top" className="hover:text-white">Contact</a>
          <a href="#top" className="hover:text-white">Privacy</a>
          <a href="#top" className="hover:text-white">Terms</a>
          <span className="flex items-center gap-3 ml-2">
            <XIcon className="h-4 w-4" />
            <Linkedin className="h-4 w-4" />
            <Youtube className="h-4 w-4" />
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div>
      <Header />
      <Hero />
      <ProblemWeSolve />
      <LiveProblemMap />
      <HowItWorks />
      <FeaturedChallenges />
      <ImpactAndCTA />
      <WhoIsYuktiFor />
      <Footer />
    </div>
  );
}
