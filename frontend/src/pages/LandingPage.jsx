import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const LOGO_ICON = "/logo.jpg";

const COLORS = {
  primary: "#312E81",
  primaryDark: "#221F5E",
  secondary: "#2563EB",
  accent: "#14B8A6",
  background: "#F8FAFC",
  card: "#FFFFFF",
  textMain: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
};

export default function LandingPage({ onLogin, onSignup }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = onLogin || (() => navigate('/login'));
  const handleSignup = onSignup || (() => navigate('/signup'));

  const PIPELINE = [
    { title: t('p1_title', '1. A problem is reported'), body: t('p1_body', 'A short description, a photo, and the exact location — submitted in plain language.'), node: COLORS.secondary },
    { title: t('p2_title', "2. It's read and scored"), body: t('p2_body', 'The report is classified by domain, checked for duplicates, and scored for priority automatically.'), node: COLORS.accent },
    { title: t('p3_title', '3. An admin verifies it'), body: t('p3_body', 'Duplicates are merged, details confirmed, and the report is released into the pipeline.'), node: COLORS.primary },
    { title: t('p4_title', '4. Matched to an institution'), body: t('p4_body', 'Expertise, track record and distance decide the best-fit university department to take it on.'), node: COLORS.secondary },
    { title: t('p5_title', '5. A team forms around it'), body: t('p5_body', 'Students join the project, and an industry partner brings funding or mentorship.'), node: COLORS.accent },
    { title: t('p6_title', '6. Impact is tracked'), body: t('p6_body', 'People reached, cost saved and satisfaction are recorded and reported back to where it started.'), node: COLORS.primary },
  ];

  const ROLES = [
    { name: t('role_1_name', 'Government / District Admin'), detail: t('role_1_detail', 'Verify incoming reports, merge duplicates, assign them to institutions, and watch analytics update in real time.') },
    { name: t('role_2_name', 'University Dean / Faculty'), detail: t('role_2_detail', "Review challenges matched to your department's strengths, accept them, and assemble a student project team.") },
    { name: t('role_3_name', 'Industry / CSR Partner'), detail: t('role_3_detail', 'Discover projects aligned to your focus areas and offer funding, equipment or mentorship.') },
    { name: t('role_4_name', 'Citizen'), detail: t('role_4_detail', "Report a problem in your own words, attach a photo and location, and follow it until it's resolved.") },
  ];

  const FEATURES = [
    { title: t('f1_title', 'Classification & priority scoring'), body: t('f1_body', 'Every report is domain-tagged and scored on affected population, urgency and severity, with the reasoning shown.') },
    { title: t('f2_title', 'Duplicate detection'), body: t('f2_body', 'Similar reports are flagged before they fragment attention, so admins merge instead of duplicating effort.') },
    { title: t('f3_title', 'Institution & student matching'), body: t('f3_body', 'A compatibility score blends subject expertise, track record and geography to suggest the right team.') },
    { title: t('f4_title', 'Industry collaboration'), body: t('f4_body', 'Partners are matched to projects by domain and funding capacity, not cold outreach.') },
    { title: t('f5_title', 'District-level mapping'), body: t('f5_body', 'Every report is geo-tagged, so patterns across districts are visible on one map, not buried in a spreadsheet.') },
    { title: t('f6_title', 'Impact dashboard'), body: t('f6_body', 'Once a solution ships, its outcomes feed into a public record of what actually changed.') },
  ];

  return (
    <div style={{ backgroundColor: COLORS.background, color: COLORS.textMain }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .yukti-display { font-family: 'Sora', sans-serif; }
        .yukti-body { font-family: 'Inter', sans-serif; }
        @keyframes yuktiFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .yukti-hero-in { animation: yuktiFadeUp 0.7s ease-out both; }
      `}</style>

      {/* top accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.accent})` }} />

      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b yukti-body"
        style={{ backgroundColor: "rgba(248,250,252,0.9)", borderColor: COLORS.border, backdropFilter: "blur(6px)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={LOGO_ICON} alt="Yukti logo" className="h-9 w-auto" />
            <span className="yukti-display text-xl font-bold" style={{ color: COLORS.primary }}>
              YUKTI
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium hidden md:inline-block" style={{ color: COLORS.textSecondary }}>
              {t('how_it_works', 'How it works')}
            </a>
            <a href="#roles" className="text-sm font-medium hidden md:inline-block" style={{ color: COLORS.textSecondary }}>
              {t('who_its_for', "Who it's for")}
            </a>
            <a href="#features" className="text-sm font-medium hidden md:inline-block" style={{ color: COLORS.textSecondary }}>
              {t('features', 'Features')}
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Header Language Tag / Dropdown */}
            <LanguageSelector />

            <button
              onClick={handleLogin}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg hidden sm:inline-block hover:bg-slate-100 transition"
              style={{ color: COLORS.primary }}
            >
              {t('log_in', 'Log in')}
            </button>
            <button
              onClick={handleSignup}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-90 transition"
              style={{ backgroundColor: COLORS.primary }}
            >
              {t('sign_up', 'Sign up')}
            </button>
            <button
              className="sm:hidden p-2"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <div style={{ width: 20, height: 2, backgroundColor: COLORS.textMain, marginBottom: 4 }} />
              <div style={{ width: 20, height: 2, backgroundColor: COLORS.textMain, marginBottom: 4 }} />
              <div style={{ width: 20, height: 2, backgroundColor: COLORS.textMain }} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden px-6 pb-4 flex flex-col gap-3 yukti-body border-t pt-2">
            <a href="#how-it-works" style={{ color: COLORS.textSecondary }}>{t('how_it_works', 'How it works')}</a>
            <a href="#roles" style={{ color: COLORS.textSecondary }}>{t('who_its_for', "Who it's for")}</a>
            <a href="#features" style={{ color: COLORS.textSecondary }}>{t('features', 'Features')}</a>
            <button onClick={handleLogin} className="text-left font-semibold" style={{ color: COLORS.primary }}>
              {t('log_in', 'Log in')}
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(600px circle at 15% 20%, ${COLORS.secondary}1A, transparent 60%),
                         radial-gradient(500px circle at 85% 10%, ${COLORS.accent}1A, transparent 55%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center yukti-body">
          <div className="yukti-hero-in">
            <h1 className="yukti-display text-4xl md:text-5xl font-bold leading-tight mb-5" style={{ color: COLORS.textMain }}>
              {t('hero_title', 'A single pipeline from a reported problem to a working solution.')}
            </h1>
            <p className="text-lg mb-8 max-w-md" style={{ color: COLORS.textSecondary }}>
              {t('hero_sub', "Yukti connects citizens, government, universities and industry on one platform — so a reported problem doesn't stall, it moves toward a fix.")}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleSignup}
                className="px-6 py-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: COLORS.primary }}
              >
                {t('get_started', 'Get started')}
              </button>
              <a
                href="#how-it-works"
                className="px-6 py-3 rounded-lg font-semibold border"
                style={{ borderColor: COLORS.border, color: COLORS.textMain }}
              >
                {t('see_how_it_works', 'See how it works')}
              </a>
            </div>
          </div>

          <div className="yukti-hero-in" style={{ animationDelay: "0.15s" }}>
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}
            >
              {PIPELINE.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{ width: 12, height: 12, backgroundColor: step.node, marginTop: 4 }}
                    />
                    {i < PIPELINE.length - 1 && (
                      <div style={{ width: 2, flexGrow: 1, backgroundColor: COLORS.border, minHeight: 28 }} />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className="font-semibold text-sm" style={{ color: COLORS.textMain }}>
                      {step.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why it exists */}
      <section className="max-w-6xl mx-auto px-6 py-16 yukti-body">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <h2 className="yukti-display text-2xl font-bold mb-3" style={{ color: COLORS.textMain }}>
              {t('why_exists_title', 'Why this exists')}
            </h2>
          </div>
          <div className="md:col-span-2">
            <p className="text-base leading-relaxed" style={{ color: COLORS.textSecondary }}>
              {t('why_exists_body', 'Real problems — a water shortage, a school without working toilets, a road that floods every year — are reported informally, if at all. They rarely reach the university department that could design a fix, or the partner that could fund one. Yukti gives every report a structured path: from the person who lives with it, through verification, to the team equipped to solve it, with the outcome tracked back to where it began.')}
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 yukti-body">
        <h2 className="yukti-display text-3xl font-bold mb-10" style={{ color: COLORS.textMain }}>
          {t('how_it_works', 'How it works')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {PIPELINE.map((step, i) => (
            <div key={step.title}>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="yukti-display font-bold text-sm rounded-full flex items-center justify-center"
                  style={{ width: 28, height: 28, backgroundColor: step.node, color: "white" }}
                >
                  {i + 1}
                </span>
                <p className="font-semibold" style={{ color: COLORS.textMain }}>
                  {step.title}
                </p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-16" style={{ backgroundColor: COLORS.primary }}>
        <div className="max-w-6xl mx-auto px-6 yukti-body">
          <h2 className="yukti-display text-3xl font-bold mb-2 text-white">
            {t('roles_title', 'Built for every stakeholder')}
          </h2>
          <p className="mb-10" style={{ color: "#C7D2FE" }}>
            {t('roles_sub', 'One platform, four ways in — each with exactly the tools that role needs.')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map((role) => (
              <div
                key={role.name}
                className="rounded-xl p-6"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <p className="font-semibold text-white mb-2">{role.name}</p>
                <p className="text-sm" style={{ color: "#C7D2FE" }}>
                  {role.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16 yukti-body">
        <h2 className="yukti-display text-3xl font-bold mb-10" style={{ color: COLORS.textMain }}>
          {t('features_heading', "What's under the hood")}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div className="rounded-full mb-3" style={{ width: 8, height: 8, backgroundColor: COLORS.accent }} />
              <p className="font-semibold mb-1" style={{ color: COLORS.textMain }}>
                {f.title}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-6xl mx-auto px-6 pb-20 yukti-body">
        <div
          className="rounded-xl p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }}
        >
          <div>
            <h3 className="yukti-display text-xl font-bold mb-1" style={{ color: COLORS.textMain }}>
              {t('cta_title', 'Have a problem worth solving?')}
            </h3>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              {t('cta_sub', 'Sign in with your role and see where you fit in the pipeline.')}
            </p>
          </div>
          <button
            onClick={handleSignup}
            className="px-6 py-3 rounded-lg text-white font-semibold whitespace-nowrap"
            style={{ backgroundColor: COLORS.primary }}
          >
            {t('cta_button', 'Get started')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="yukti-body" style={{ backgroundColor: COLORS.primaryDark }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src={LOGO_ICON}
              alt="Yukti logo"
              className="h-6 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <span className="yukti-display font-bold text-white">YUKTI</span>
          </div>
          <p className="text-xs" style={{ color: "#A5B4FC" }}>
            © 2026 Yukti. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
