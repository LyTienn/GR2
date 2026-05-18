import React, { useState } from 'react';
import { Settings2, BookOpen, Maximize, Minimize, X, ChevronRight } from "lucide-react";
import SettingsPanel from './SettingsPanel';
import NotesPanel from './NotesPanel';

export default function RightSidebar({ 
  readerSettings, 
  updateSetting, 
  highlights, 
  handleJumpToNote, 
  currentTheme, 
  isFullScreen,
  toggleFullScreen,
  t 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');

  const handleOpenTab = (tab) => {
    if (isOpen && activeTab === tab) {
      setIsOpen(false);
    } else {
      setActiveTab(tab);
      setIsOpen(true);
    }
  };

  const themeClasses = `${currentTheme.container} border-l ${currentTheme.text}`;
  const sidebarBorder = currentTheme.container.includes('slate-50') ? 'border-slate-200'
                       : currentTheme.container.includes('e9dec5') ? 'border-[#d5c7a3]'
                       : 'border-slate-700';

  return (
    <div className={`flex shrink-0 ease-in-out h-screen sticky top-0 ${themeClasses} ${isOpen ? 'w-80' : 'w-14'}`}>
      <div className={`w-14 flex flex-col items-center py-4 space-y-4 ${isOpen ? `border-r ${sidebarBorder}` : ''}`}>
        <button 
          onClick={toggleFullScreen}
          className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={isFullScreen ? t("layout.readpage.exitFullscreen") : t("layout.readpage.fullscreen")}
        >
          {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => handleOpenTab('notes')}
          className={`p-2 rounded-md transition-colors ${isOpen && activeTab === 'notes' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          title={t("layout.readpage.notes")}
        >
          <BookOpen className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleOpenTab('settings')}
          className={`p-2 rounded-md transition-colors ${isOpen && activeTab === 'settings' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
          title={t("layout.readpage.settings")}
        >
          <Settings2 className="w-5 h-5" />
        </button>
        <div className="flex-1" />
      </div>

      {isOpen && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className={`h-14 flex items-center px-4 border-b ${sidebarBorder} shrink-0`}>
            <h3 className="font-semibold uppercase tracking-wider text-sm opacity-80">
              {activeTab === 'notes' ? t("layout.readpage.note.title") : t("layout.readpage.showSetting.label")}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'notes' ? (
              <NotesPanel highlights={highlights} handleJumpToNote={handleJumpToNote} t={t} />
            ) : (
              <SettingsPanel readerSettings={readerSettings} updateSetting={updateSetting} t={t} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}