import React from 'react';
import { useTranslation } from 'react-i18next';
import viFlag from "@/assets/viFlag.png";
import enFlag from "@/assets/enFlag.png";

const LanguageSwitcher = ({ className = "" }) => {
  const { i18n } = useTranslation();

  return (
    <div className={`flex items-center w-fit bg-[#9ea6b5] p-[3.25px] rounded-lg ${className}`}>  
      <button
        onClick={() => i18n.changeLanguage('vi')}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 text-slate-900 ${
          i18n.language === 'vi' 
            ? 'bg-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_0_rgba(0,0,0,0.1)]' // Được chọn: Nền trắng, có bóng đổ đổ nổi
            : 'hover:bg-black/10' 
        }`}
      >
        <img 
          src={viFlag} 
          alt="vi" 
          className="w-4 h-auto rounded-xs object-cover shrink-0" 
        />
        <span className="hidden md:block text-xs font-bold tracking-tight">VI</span>
      </button>

      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 text-slate-900 ${
          i18n.language?.startsWith('en') 
            ? 'bg-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_0_rgba(0,0,0,0.1)]'
            : 'hover:bg-black/10'
        }`}
      >
        <img 
          src={enFlag} 
          alt="en" 
          className="w-4 h-auto rounded-xs object-cover shrink-0" 
        />
        <span className="hidden md:block text-xs font-bold tracking-tight">EN</span>
      </button>

    </div>
  );
};

export default LanguageSwitcher;