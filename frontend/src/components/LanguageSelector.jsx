import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

export default function LanguageSelector({ className = '' }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left z-50 ${className}`} ref={dropdownRef}>
      {/* Header Language Tag / Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full border border-indigo-200/40 bg-white/10 hover:bg-white/20 text-slate-800 dark:text-white backdrop-blur-md shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
        title="Select Language / भाषा चुनें"
      >
        <Globe className="w-4 h-4 text-indigo-500 animate-pulse" />
        <span className="font-medium tracking-wide">
          {currentLang.nativeName.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
          <div className="px-3 py-2 bg-indigo-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60">
            <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
              Select Language / भाषा चुनें
            </p>
          </div>
          <div className="py-1 max-h-64 overflow-y-auto">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors duration-150 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold">{lang.nativeName}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
