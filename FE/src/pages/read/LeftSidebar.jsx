import React, { useState, useEffect } from 'react';
import { List, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { THEMES } from '@/hooks/useReaderSetting';

export default function LeftSidebar({ 
  chapters, 
  selectedChapter, 
  setSelectedChapter, 
  currentTheme,  
  setShowUpgradeModal,
  t 
}) {
  const [isOpen, setIsOpen] = useState(true);
  
  const themeClasses = `${currentTheme.container} border-r ${currentTheme.text}`;
  const sidebarBorder = currentTheme === THEMES.light ? 'border-slate-200' 
                       : currentTheme === THEMES.sepia ? 'border-[#d5c7a3]'
                       : 'border-slate-700';
  const isChapterLocked = (chapter) => Boolean(chapter?.isLocked || chapter?.is_premium);

  return (
    <div className={`flex flex-col shrink-0 ease-in-out h-screen sticky top-0 ${themeClasses} ${isOpen ? 'w-64' : 'w-14'}`}>
      <div className={`h-14 flex items-center justify-between px-4 border-b ${sidebarBorder} shrink-0 relative`}>
        {isOpen && (
          <span className="font-semibold text-xs uppercase tracking-wider opacity-80 flex items-center gap-2">
            <List className="w-4 h-4" />
            {t("layout.readpage.tableOfContents")}
          </span>
        )}
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!isOpen ? 'absolute left-1/2 -translate-x-1/2 top-3' : ''}`}
          title={isOpen ? t("layout.readpage.leftSidebar.collapse") : t("layout.readpage.leftSidebar.expand")}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {chapters?.map((chapter) => {
            const isSelected = selectedChapter?.id === chapter.id;
            const locked = isChapterLocked(chapter);
            return (
              <button
                key={chapter.id}
                onClick={() => {
                  if (locked) {
                    setShowUpgradeModal(true);
                  } else {
                    setSelectedChapter(chapter);
                  }
                }}
                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between border-b border-inherit transition-colors ${
                  isSelected 
                    ? 'bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400 border-l-4 border-l-blue-500 pl-3' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                }`}
              >
                <span className="truncate pr-2">{chapter.title}</span>
                {locked && (
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
