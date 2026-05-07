import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { List, FileText, ArrowLeft, Loader2, Lock, Maximize, Minimize, Settings2 } from "lucide-react";
import Pagination from "@/components/Pagination";
import Header from "@/components/HeaderBar";
import { toast } from "react-toastify";
import HttpClient from "@/service/HttpClient";
import { firstValueFrom } from "rxjs";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";
import useReaderSettings from "@/hooks/useReaderSetting";
import useBookReader from "@/hooks/useBookReader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ReadBookPage() {
  const { t } = useTranslation();
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { 
    book, chapters, selectedChapter, setSelectedChapter, 
    loading, showUpgradeModal, setShowUpgradeModal, initialScrollPos 
  } = useBookReader(bookId, isAuthenticated, t);

  const { 
    showSettings, setShowSettings, settingsRef, 
    readerSettings, updateSetting, currentTheme 
  } = useReaderSettings();

  // Tự động đóng sidebar nếu mở trên điện thoại, mở trên Desktop
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const isUserPremium = user?.tier === "PREMIUM" || user?.role === "ADMIN";
  const isRestoring = useRef(false);
  const hasMarkedCompleted = useRef(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const activeChapterRef = useRef(null);
  const contentRef = useRef(null);

  const saveProgress = useRef(
    debounce(async (bId, cId, scrollPercent) => {
      try {
        await firstValueFrom(
          HttpClient.put(`/bookshelf/books/${bId}/progress`, {
            chapterId: cId,
            scrollPosition: scrollPercent
          })
        );
      } catch (error) {
        console.error("❌ Lỗi lưu tiến độ:", error);
      }
    }, 1000)
  ).current;

  useEffect(() => {
    return () => saveProgress.cancel();
  }, [saveProgress]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(t("toasts.error.authenticatedToRead"));
      navigate("/login");
    }
  }, [isAuthenticated, navigate, t]);

  useEffect(() => {
    if (selectedChapter?.id && selectedChapter?.content && contentRef.current) {
      if (initialScrollPos > 0) {
        isRestoring.current = true;
        setTimeout(() => {
            const element = contentRef.current;
            if (!element) return;
            const scrollHeight = element.scrollHeight;
            const clientHeight = element.clientHeight;
            const maxScroll = scrollHeight - clientHeight;
            const targetPixel = (initialScrollPos / 100) * maxScroll;
            
            element.scrollTo({ top: targetPixel, behavior: 'smooth' });
            setTimeout(() => { isRestoring.current = false; }, 600);
        }, 100); 
      } else {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [selectedChapter?.id, selectedChapter?.content, initialScrollPos]);

  useEffect(() => {
    if (sidebarOpen && activeChapterRef.current) {
      activeChapterRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedChapter?.id, sidebarOpen]);

  const markBookAsCompleted = async () => {
    if (hasMarkedCompleted.current) return;
    hasMarkedCompleted.current = true;
    saveProgress.cancel();
    try {
      await firstValueFrom(HttpClient.delete(`/bookshelf/books/${bookId}?status=READING`));
    } catch (error) {
      hasMarkedCompleted.current = false;
    }
  };

  const handleScroll = (e) => {
    if (isRestoring.current || hasMarkedCompleted.current) return;
    if (!isAuthenticated || !selectedChapter) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - clientHeight <= 0) return;
    
    const scrolledPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
    const currentIndex = getCurrentChapterIndex();
    const isLastChapter = currentIndex === chapters.length - 1;

    if (isLastChapter && scrolledPercent > 95) {
      markBookAsCompleted();
    } else {
      saveProgress(bookId, selectedChapter.id, scrolledPercent);
    }
  };

  const getCurrentChapterIndex = () => {
    if (!selectedChapter || chapters.length === 0) return -1;
    return chapters.findIndex(ch => ch.id === selectedChapter.id);
  };

  const handleSelectChapter = (ch) => {
    if (ch.isLocked || (!isUserPremium && ch.isPremium)) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedChapter(ch);
    // Tự động đóng mục lục trên mobile khi chọn xong chương
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handlePageChange = (newPage) => {
    const targetChapter = chapters[newPage - 1];
    if (targetChapter) {
      if (targetChapter.isLocked || (!isUserPremium && targetChapter.isPremium)) {
        setShowUpgradeModal(true);
      } else {
        setSelectedChapter(targetChapter);
        if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error(t("toasts.error.fullscreenFailed", { message: err.message }));
      });
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (loading || !book) return <div className="min-h-screen bg-slate-50"><Header /><div className="container mx-auto p-4 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div></div>;

  const currentIndex = getCurrentChapterIndex();
  const themeClasses = currentTheme || { container: "bg-slate-50", paper: "bg-white", heading: "text-slate-900", text: "text-slate-700" };
  const safeSettings = readerSettings || { fontSize: 20, fontFamily: 'font-serif', theme: 'light' };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${themeClasses.container} theme-${safeSettings.theme}`}>
      
      {/* LỚP PHỦ OVERLAY TRÊN MOBILE (Bấm vào để đóng Sidebar) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR MỤC LỤC */}
      <aside className={`absolute md:relative z-40 h-full border-r shrink-0 transition-all duration-300 ease-in-out flex flex-col 
        ${sidebarOpen ? 'w-[85%] sm:w-80 translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0 md:w-12'} 
        ${safeSettings.theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 
          safeSettings.theme === 'sepia' ? 'bg-[#e9dec5] border-[#d6c5a5] text-[#5b4636]' : 
          'bg-white border-slate-200 text-slate-700'}`}
      >
        <div className={`h-14 border-b flex items-center justify-between px-3 
          ${safeSettings.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 
            safeSettings.theme === 'sepia' ? 'bg-[#dfd0b2] border-[#d6c5a5]' : 
            'bg-slate-50 border-slate-200'}`}
        >
          {sidebarOpen ? (
            <>
              <h2 className={`font-bold flex items-center gap-2 truncate ${safeSettings.theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                <FileText className="h-4 w-4" /> {t("layout.readpage.tableOfContents")}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className={safeSettings.theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : ''}>
                <List className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className={safeSettings.theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : ''}>
                <List className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {chapters.map((ch, index) => {
              const isActive = selectedChapter?.id === ch.id;
              let activeClass = 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600';
              let hoverClass = 'hover:bg-slate-100 border-l-4 border-transparent';
              
              if (safeSettings.theme === 'dark') {
                activeClass = 'bg-slate-800 text-blue-400 font-semibold border-l-4 border-blue-500';
                hoverClass = 'hover:bg-slate-900 border-l-4 border-transparent';
              } else if (safeSettings.theme === 'sepia') {
                activeClass = 'bg-[#d2c09c] text-[#433422] font-semibold border-l-4 border-[#8a6b4e]';
                hoverClass = 'hover:bg-[#dfd0b2] border-l-4 border-transparent';
              }

              return (
                <button
                  key={ch.id || index}
                  ref={isActive ? activeChapterRef : null}
                  onClick={() => handleSelectChapter(ch)}
                  className={`w-full text-left px-4 py-3 text-sm rounded-md transition-colors duration-200 mb-1 ${isActive ? activeClass : hoverClass}`}
                >
                  <span className="line-clamp-2">{ch.title || `Chương ${index + 1}`}</span>
                  {ch.isLocked && <Lock className="h-3 w-3 opacity-50 shrink-0 ml-2" />}
                </button>
              )
            })}
          </div>
        )}
      </aside>

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className={`h-14 border-b flex items-center px-2 sm:px-4 justify-between shadow-sm z-10 shrink-0 gap-2 sm:gap-4 transition-colors duration-300
          ${safeSettings.theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 
            safeSettings.theme === 'sepia' ? 'bg-[#e9dec5] border-[#d6c5a5] text-[#5b4636]' : 
            'bg-white border-slate-200 text-slate-800'}`}
        >
          <div className="flex items-center gap-1 sm:gap-3 min-w-0 shrink">
            {/* NÚT MENU DÀNH RIÊNG CHO MOBILE */}
            <Button 
              variant="ghost" 
              size="sm" 
              className={`md:hidden px-2 ${safeSettings.theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : ''}`}
              onClick={() => setSidebarOpen(true)}
            >
              <List className="h-5 w-5" />
            </Button>

            <Link to={`/book/${book.id}`}>
              <Button variant="ghost" size="sm" className={`px-2 ${safeSettings.theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : ''}`}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-semibold truncate text-sm sm:text-base">{book.title}</h1>
          </div>
          
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* NÚT VÀ MENU SETTINGS */}
            <div className="relative" ref={settingsRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettings(!showSettings)}
                className={`px-2 transition-colors duration-200 ${
                  safeSettings.theme === 'dark' 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                    : safeSettings.theme === 'sepia'
                    ? 'text-[#5b4636] hover:text-[#433422] hover:bg-[#d6c5a5]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={t("layout.readpage.showSetting.label")}
              >
                <Settings2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>

              {showSettings && (
                <div className="absolute right-0 top-12 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-5 z-50 text-slate-800">
                  <h3 className="font-semibold mb-4 border-b pb-2">{t("layout.readpage.showSetting.title")}</h3>
                  <div className="mb-4">
                    <label className="text-sm text-slate-600 mb-2 block">{t("layout.readpage.showSetting.fontSize")}: {safeSettings.fontSize}px</label>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={() => updateSetting('fontSize', Math.max(14, safeSettings.fontSize - 2))}>A-</Button>
                      <input type="range" min="14" max="36" step="2" className="flex-1 cursor-pointer accent-blue-600" value={safeSettings.fontSize} onChange={(e) => updateSetting('fontSize', Number(e.target.value))} />
                      <Button variant="outline" size="sm" onClick={() => updateSetting('fontSize', Math.min(36, safeSettings.fontSize + 2))}>A+</Button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-sm text-slate-600 mb-2 block">{t("layout.readpage.showSetting.fontStyle")}</label>
                    <div className="flex gap-2">
                      <Button variant={safeSettings.fontFamily === 'font-serif' ? 'default' : 'outline'} size="sm" className="flex-1 font-serif" onClick={() => updateSetting('fontFamily', 'font-serif')}>Serif</Button>
                      <Button variant={safeSettings.fontFamily === 'font-sans' ? 'default' : 'outline'} size="sm" className="flex-1 font-sans" onClick={() => updateSetting('fontFamily', 'font-sans')}>Sans</Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 mb-2 block">{t("layout.readpage.showSetting.bgColor")}</label>
                    <div className="flex gap-3">
                      <button className={`w-8 h-8 rounded-full border-2 ${safeSettings.theme === 'light' ? 'border-blue-500 scale-110' : 'border-slate-200'} bg-white shadow-sm transition-transform`} onClick={() => updateSetting('theme', 'light')} title={t("layout.readpage.showSetting.lightBtn")}></button>
                      <button className={`w-8 h-8 rounded-full border-2 ${safeSettings.theme === 'sepia' ? 'border-blue-500 scale-110' : 'border-[#e2d5b6]'} bg-[#f4ecd8] shadow-sm transition-transform`} onClick={() => updateSetting('theme', 'sepia')} title={t("layout.readpage.showSetting.sepiaBtn")}></button>
                      <button className={`w-8 h-8 rounded-full border-2 ${safeSettings.theme === 'dark' ? 'border-blue-500 scale-110' : 'border-slate-700'} bg-slate-900 shadow-sm transition-transform`} onClick={() => updateSetting('theme', 'dark')} title={t("layout.readpage.showSetting.darkBtn")}></button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleFullScreen}
              className={`px-2 hidden sm:flex transition-colors duration-200 ${
                  safeSettings.theme === 'dark' 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                    : safeSettings.theme === 'sepia'
                    ? 'text-[#5b4636] hover:text-[#433422] hover:bg-[#d6c5a5]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isFullScreen ? t("layout.readpage.fullscreenOff") : t("layout.readpage.fullscreenOn")}
            >
              {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div
          ref={contentRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto transition-colors duration-300 ${themeClasses.container} custom-scrollbar`}
        >
          {/* TỐI ƯU PADDING ĐỂ CHỮ TRẢI RỘNG TRÊN MOBILE */}
          <div className="min-h-full w-full flex justify-center p-0 sm:p-6 md:p-10 lg:p-14">
            <div className={`w-full max-w-4xl shadow-sm border-x sm:border rounded-none sm:rounded-lg p-5 sm:p-10 md:p-12 h-fit transition-colors duration-300 ${themeClasses.paper}`}>
              {selectedChapter ? (
                <>
                  <article className="w-full mt-2 sm:mt-8">
                    <h2 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 border-b pb-4 leading-tight transition-colors duration-300 ${themeClasses.heading}`}>
                      {selectedChapter.title}
                    </h2>
                    {/* Bỏ margin cứng mx-16 trên mobile */}
                    <div 
                      className={`mx-0 md:mx-8 lg:mx-16 max-w-3xl whitespace-pre-line leading-relaxed text-justify transition-all duration-300 ${themeClasses.text} ${safeSettings.fontFamily}`}
                      style={{ fontSize: `${safeSettings.fontSize}px` }}
                    >
                      {selectedChapter.content}
                    </div>
                    {/* Thanh Pagination ôm sát viền */}
                    <div className={`sticky bottom-0 z-40 backdrop-blur-md -mx-5 sm:-mx-10 md:-mx-12 px-5 sm:px-10 md:px-12 py-3 border-t mt-8 transition-all
                      ${safeSettings.theme === 'dark' ? 'bg-slate-900/90 border-slate-800 **:text-slate-300 [&_button:hover]:bg-slate-800 [&_button:hover]:text-white' : 
                        safeSettings.theme === 'sepia' ? 'bg-[#f4ecd8]/90 border-[#e2d5b6] **:text-[#5b4636] [&_button:hover]:bg-[#dfd0b2]' : 
                        'bg-white/95 border-slate-200 **:text-slate-700'}`}
                    >
                      <Pagination 
                        currentPage={currentIndex + 1} 
                        totalPages={chapters.length} 
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </article>
                </>
              ) : <div className="text-center text-slate-400 py-20">Vui lòng chọn chương</div>}
            </div>
          </div>
        </div>
      </main >

      {/* MODAL NÂNG CẤP PREMIUM */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-yellow-100 p-3 rounded-full w-fit mb-2">
              <Lock className="h-6 w-6 text-yellow-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              {t("layout.readpage.showUpgradeModal.dialogTitle")}
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {t("layout.readpage.showUpgradeModal.dialogDes1")} <br />
              {t("layout.readpage.showUpgradeModal.dialogDes2")} <strong>{t("layout.readpage.showUpgradeModal.dialogDes3")}</strong> {t("layout.readpage.showUpgradeModal.dialogDes4")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)} className="hover:bg-gray-200">
              {t("layout.readpage.showUpgradeModal.laterBtn")}
            </Button>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => navigate('/membership')}>
              {t("layout.readpage.showUpgradeModal.upgradeBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}