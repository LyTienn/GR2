import React, { useState, useRef, useEffect } from 'react';
import { Settings2, BookOpen, Maximize, Minimize, X, ChevronRight, Bot } from "lucide-react";
import SettingsPanel from './SettingsPanel';
import NotesPanel from './NotesPanel';
import ChatPanel from './ChatPanel';

export default function RightSidebar({ 
  readerSettings, 
  updateSetting, 
  highlights, 
  handleJumpToNote, 
  currentTheme, 
  isFullScreen,
  toggleFullScreen,
  bookTitle,
  chapterId,
  t 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [sidebarWidth, setSidebarWidth] = useState(320); 
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!sidebarRef.current) return;
      const container = sidebarRef.current.parentElement;
      if (!container) return;
      const containerRight = container.getBoundingClientRect().right;
      const newWidth = containerRight - e.clientX;
      
      if (newWidth >= 320 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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
    <div 
      ref={sidebarRef}
      className={`flex shrink-0 ease-in-out h-screen sticky top-0 ${themeClasses} ${isResizing ? 'select-none' : ''} theme-${readerSettings?.theme || 'light'}`}
      style={{
        width: isOpen ? `${sidebarWidth}px` : '56px'
      }}
    >
      {isOpen && (
        <div 
          onMouseDown={handleMouseDown}
          className={`w-1 cursor-col-resize transition-colors ${isResizing}`}
          style={{ cursor: 'col-resize' }}
        />
      )}

      <div className={`w-14 flex flex-col items-center py-4 space-y-4 ${isOpen ? `border-r ${sidebarBorder}` : ''}`}>
        <button 
          onClick={toggleFullScreen}
          className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/15 transition-colors"
          title={isFullScreen ? t("layout.readpage.fullscreenOff") : t("layout.readpage.fullscreenOn")}
        >
          {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => handleOpenTab('notes')}
          className={`p-2 rounded-md transition-colors ${isOpen && activeTab === 'notes' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-black/5 dark:hover:bg-white/15'}`}
          title={t("layout.readpage.note.label")}
        >
          <BookOpen className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleOpenTab('settings')}
          className={`p-2 rounded-md transition-colors ${isOpen && activeTab === 'settings' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-black/5 dark:hover:bg-white/15'}`}
          title={t("layout.readpage.showSetting.setting")}
        >
          <Settings2 className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleOpenTab('chat')}
          className={`p-2 rounded-md transition-colors ${isOpen && activeTab === 'chat' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-black/5 dark:hover:bg-white/15'}`}
          title="AI Chatbot"
        >
          <Bot className="w-5 h-5" />
        </button>
        <div className="flex-1" />
      </div>

      {isOpen && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className={`h-14 flex items-center px-4 border-b ${sidebarBorder} shrink-0`}>
            <h3 className="font-semibold uppercase tracking-wider text-sm opacity-80">
              {activeTab === 'notes' ? t("layout.readpage.note.title") 
              : activeTab === 'settings' ? t("layout.readpage.showSetting.label")
              : 'AI Chatbot'}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'notes' ? (
              <NotesPanel highlights={highlights} handleJumpToNote={handleJumpToNote} t={t} />
            ) : activeTab === 'settings' ? (
              <SettingsPanel readerSettings={readerSettings} updateSetting={updateSetting} t={t} />
            ) : (
              <ChatPanel bookTitle={bookTitle} chapterId={chapterId} t={t} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}