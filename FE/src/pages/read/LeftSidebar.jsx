import React, { useEffect, useRef, useState } from 'react';
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
  const selectedChapterRef = useRef(null);
  
  const themeClasses = `${currentTheme.container} border-r ${currentTheme.text}`;
  const sidebarBorder = currentTheme === THEMES.light ? 'border-slate-200' 
                       : currentTheme === THEMES.sepia ? 'border-[#d5c7a3]'
                       : 'border-slate-700';
  const isChapterLocked = (chapter) => Boolean(chapter?.isLocked || chapter?.is_premium);

  useEffect(() => {
    if (!isOpen) return;
    selectedChapterRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [isOpen, selectedChapter?.id]);

  return (
    <div className={`flex flex-col shrink-0 ease-in-out h-screen sticky top-0 transition-[width] duration-200 ${themeClasses} ${isOpen ? 'w-64' : 'w-14'}`}>
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

      {!isOpen && (
        <div className="flex-1 flex flex-col items-center pt-4">
          <div
            className="p-2 rounded-md opacity-70"
            title={t("layout.readpage.tableOfContents")}
          >
            <List className="w-5 h-5" />
          </div>
        </div>
      )}

      {isOpen && (
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {chapters?.length ? chapters.map((chapter, index) => {
            const isSelected = selectedChapter?.id === chapter.id;
            const locked = isChapterLocked(chapter);
            return (
              <button
                key={chapter.id}
                ref={isSelected ? selectedChapterRef : null}
                title={chapter.title}
                onClick={() => {
                  if (locked) {
                    setShowUpgradeModal(true);
                  } else {
                    setSelectedChapter(chapter);
                  }
                }}
                className={`group w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 rounded-md transition-colors ${
                  isSelected 
                    ? 'bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400' 
                    : locked
                      ? 'opacity-60 hover:opacity-90 hover:bg-amber-500/10'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                }`}
              >
                <span className={`w-7 shrink-0 text-[11px] font-semibold tabular-nums ${isSelected ? 'text-blue-500' : 'opacity-50'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{chapter.title}</span>
                  {locked && (
                    <span className="mt-0.5 block text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      {t("layout.readpage.leftSidebar.locked")}
                    </span>
                  )}
                </span>
                {locked && (
                  <span className="shrink-0 rounded-full bg-amber-500/10 p-1 text-amber-600 dark:text-amber-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          }) : (
            <div className="h-full flex items-center justify-center px-4 text-center text-sm opacity-60">
              {t("layout.readpage.leftSidebar.empty")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
