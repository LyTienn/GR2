import React from 'react';
import { useTranslation } from 'react-i18next';

// Tách cờ Việt Nam
const FlagVI = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 rounded-sm shadow-xs">
    <rect width="512" height="512" fill="#da251d"/>
    <polygon fill="#ff0" points="256,114 300,248 442,248 327,331 371,465 256,382 141,465 185,331 70,248 212,248"/>
  </svg>
);
// Tách cờ Anh
const FlagEN = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-5 h-4 rounded-sm shadow-xs">
    <clipPath id="a"><path d="M0 0h60v30H0z"/></clipPath>
    <g clipPath="url(#a)"><path d="M0 0h60v30H0z" fill="#012169"/>
    <path d="m0 0 60 30M60 0 0 30" stroke="#fff" strokeWidth="6"/><path d="m0 0 60 30M60 0 0 30" stroke="#c8102e" strokeWidth="4"/>
    <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6"/></g>
  </svg>
);

const LanguageSwitcher = ({ className = "" }) => {
  const { i18n } = useTranslation();

  return (
    <div className={`flex items-center w-fit bg-slate-200/60 p-1 rounded-lg border border-slate-300/50 ${className}`}>
      {/* Nút Tiếng Việt */}
      <button
        onClick={() => i18n.changeLanguage('vi')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
          i18n.language === 'vi' 
            ? 'bg-white text-slate-900 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/30' 
        }`}
      >
        <FlagVI />
        <span className="text-xs font-bold tracking-tight">VI</span>
      </button>

      {/* Nút Tiếng Anh */}
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
          i18n.language?.startsWith('en') 
            ? 'bg-white text-slate-900 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/30'
        }`}
      >
        <FlagEN />
        <span className="text-xs font-bold tracking-tight">EN</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;