import React, { useState } from 'react';
import { useLanguage, LANGUAGES, type Language } from '../../context/LanguageContext';
import { X, Globe, Check, Search, Sparkles } from 'lucide-react';

interface LanguageDrawerProps {
  onLanguageChanged?: (lang: Language) => void;
}

export const LanguageDrawer: React.FC<LanguageDrawerProps> = ({ onLanguageChanged }) => {
  const { currentLanguage, setLanguage, isDrawerOpen, closeLanguageDrawer, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isDrawerOpen) return null;

  const filteredLanguages = LANGUAGES.filter((lang) => {
    const q = searchQuery.toLowerCase();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.region.toLowerCase().includes(q)
    );
  });

  const handleSelect = (lang: Language) => {
    setLanguage(lang.code);
    if (onLanguageChanged) {
      onLanguageChanged(lang);
    }
    closeLanguageDrawer();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Darkened Backdrop Overlay with Blur */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeLanguageDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Slide Section Drawer Content */}
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-emerald-900/10 flex flex-col justify-between transform transition-transform duration-300 ease-in-out">
          
          {/* Drawer Header */}
          <div className="p-6 bg-gradient-to-r from-[#1B4332] via-[#2D6A4F] to-[#40916C] text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
                  <Globe className="w-5 h-5 text-emerald-200 animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    <span>{t('select_language', 'Select Regional Language')}</span>
                  </h2>
                  <p className="text-xs text-emerald-100/90 font-medium">
                    {t('language_subtitle', 'Choose your preferred regional language')}
                  </p>
                </div>
              </div>

              <button
                onClick={closeLanguageDrawer}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title={t('close', 'Close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input Filter */}
            <div className="mt-5 relative">
              <Search className="w-4 h-4 text-emerald-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_languages', 'Search languages...')}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/15 border border-white/25 text-xs text-white placeholder:text-emerald-100/70 focus:outline-none focus:bg-white/25 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-200 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Languages List Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#f8faf8]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('regional_language', 'Regional Languages')} ({filteredLanguages.length})
              </span>
              <span className="text-[11px] text-[#2D6A4F] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-Translates Website
              </span>
            </div>

            {filteredLanguages.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <p className="text-sm font-semibold text-slate-600">No language found</p>
                <p className="text-xs text-slate-400">Try searching for another Indian regional language</p>
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#E2F0D9] to-[#D8F3DC] border-[#2D6A4F]/40 shadow-sm ring-1 ring-[#2D6A4F]/20'
                        : 'bg-white hover:bg-[#edf4ee] border-slate-200/80 hover:border-[#2D6A4F]/30 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Flag / Script Badge Pill */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-105 ${
                          isSelected
                            ? 'bg-[#2D6A4F] text-white shadow-xs'
                            : 'bg-emerald-50 text-[#2D6A4F] border border-emerald-100'
                        }`}
                      >
                        {lang.scriptBadge}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 leading-none">
                            {lang.nativeName}
                          </span>
                          <span className="text-xs text-slate-400 font-normal">
                            ({lang.name})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {lang.region}
                        </p>
                      </div>
                    </div>

                    {/* Checkmark Status Indicator */}
                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center shadow-xs shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full border border-slate-300 group-hover:border-[#2D6A4F] flex items-center justify-center text-slate-300 group-hover:text-[#2D6A4F] transition-colors shrink-0">
                        <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Drawer Footer Banner */}
          <div className="p-4 bg-white border-t border-slate-200/80 space-y-3">
            <div className="p-3 rounded-2xl bg-[#eaf4eb] border border-[#d8e8dc] flex items-start gap-3">
              <Globe className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 leading-snug">
                Selecting a language updates all headers, cards, navigation buttons, and dynamic content automatically across the sanctuary platform.
              </div>
            </div>

            <button
              onClick={closeLanguageDrawer}
              className="w-full py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
            >
              {t('close', 'Done')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
