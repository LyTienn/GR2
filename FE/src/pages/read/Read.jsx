import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HttpClient from "@/service/HttpClient";
import { firstValueFrom } from "rxjs";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Pagination from "@/components/Pagination";
import { useTranslation } from "react-i18next";
import useReaderSettings from "@/hooks/useReaderSetting";
import useBookReader from "@/hooks/useBookReader";
import useChapterNotes from "@/hooks/useChapterNotes";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
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
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { 
    book, chapters, selectedChapter, setSelectedChapter, 
    loading, showUpgradeModal, setShowUpgradeModal, initialScrollPos 
  } = useBookReader(bookId, isAuthenticated, t);
  const { 
    readerSettings, updateSetting, currentTheme 
  } = useReaderSettings();
  const themeMode = readerSettings.theme;
  const noteProps = useChapterNotes(bookId, selectedChapter?.id, isAuthenticated, t);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hoveredNoteId, setHoveredNoteId] = useState(null);

  const activeChapterRef = useRef(null);
  const contentRef = useRef(null);
  const pendingJumpRef = useRef(null);
  const isFirstLoad = useRef(true);
  const scrollTimeoutRef = useRef(null);
  const currentChapterIndex = chapters?.findIndex(c => c.id === selectedChapter?.id) ?? 0;
  const currentPage = currentChapterIndex + 1;
  const totalPages = chapters?.length || 0;
  const handlePageChange = (page) => {
    const targetChapter = chapters[page - 1]; 
    if (targetChapter) {
      if (targetChapter.is_premium) {
        setShowUpgradeModal(true);
      } else {
        setSelectedChapter(targetChapter);
      }
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // effect trạng thái fullscreen 
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    if (!loading && pendingJumpRef.current && selectedChapter?.id === pendingJumpRef.current.chapter_id) {
      const note = pendingJumpRef.current;
      pendingJumpRef.current = null;
      setTimeout(() => {
        const element = document.getElementById(`note-marker-${note.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [selectedChapter, loading]);

  const handleJumpToNote = (note) => {
    if (!note) return;
    if (note.chapter_id !== selectedChapter?.id) {
      const targetChapter = chapters.find(c => c.id === note.chapter_id);
      if (targetChapter) {
        if (targetChapter.is_premium) {
          setShowUpgradeModal(true);
          return;
        }
        pendingJumpRef.current = note;
        setSelectedChapter(targetChapter);
      }
    } else {
      const element = document.getElementById(`note-marker-${note.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleScroll = (e) => {
  if (!isAuthenticated || !selectedChapter || loading) return;
  
  requestAnimationFrame(() => {
    const currentPos = Math.round(e.target.scrollTop);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(async () => {  
      try {
        await firstValueFrom(
          HttpClient.put(`/bookshelf/books/${bookId}/progress`, {
            chapterId: selectedChapter.id,
            scrollPosition: currentPos
          })
        );
      } catch (err) {
        console.error("Lỗi cập nhật tiến độ:", err);
      }
    }, 1500);
  });
};

  // Khôi phục vị trí cuộn chương sách
  useEffect(() => {
    if (!loading && activeChapterRef.current) {
      setTimeout(() => {
        if (activeChapterRef.current) {
          if (isFirstLoad.current && initialScrollPos > 0) {
            activeChapterRef.current.scrollTo({ top: initialScrollPos, behavior: 'smooth' });
            isFirstLoad.current = false; 
          } 
          else {
            activeChapterRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            isFirstLoad.current = false; 
          }
        }
      }, 100);
    }
  }, [selectedChapter?.id, loading, initialScrollPos]);

  const renderHighlightedText = (text, highlightsList) => {
    if (!text) return null;
    const currentChapterNotes = (highlightsList || []).filter(
      (note) => note.chapter_id === selectedChapter?.id
    );
    if (currentChapterNotes.length === 0) return text;
    const healedNotes = currentChapterNotes.map(hl => {
      let start = hl.start_index;
      let end = hl.end_index;
      const currentSlice = text.slice(start, end);
      if (hl.selected_text && currentSlice !== hl.selected_text) {
        let exactStart = text.indexOf(hl.selected_text, Math.max(0, start - 100));
        if (exactStart === -1 || Math.abs(exactStart - start) > 200) {
            exactStart = text.indexOf(hl.selected_text); 
        }
        if (exactStart !== -1) {
            start = exactStart;
            end = exactStart + hl.selected_text.length;
        }
      }
      return { ...hl, start_index: start, end_index: end };
    });

    let boundaries = new Set([0, text.length]);
    healedNotes.forEach(hl => {
      boundaries.add(Math.max(0, Math.min(hl.start_index, text.length)));
      boundaries.add(Math.max(0, Math.min(hl.end_index, text.length)));
    });
    const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sortedBoundaries.length - 1; i++) {
      const start = sortedBoundaries[i];
      const end = sortedBoundaries[i + 1];
      if (start === end) continue;
      const segmentText = text.slice(start, end);
      const coveringHighlights = healedNotes.filter(
        hl => hl.start_index <= start && hl.end_index >= end
      );
      if (coveringHighlights.length > 0) {
        const topHighlight = coveringHighlights.sort((a, b) => {
          const lenA = a.end_index - a.start_index;
          const lenB = b.end_index - b.start_index;
          return lenA - lenB;
        })[0];
        const isHovered = hoveredNoteId && coveringHighlights.some(hl => hl.id === hoveredNoteId);
        result.push(
          <span
            key={`${start}-${end}`}
            id={start === topHighlight.start_index ? `note-marker-${topHighlight.id}` : undefined}
            className="relative inline cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              noteProps.setViewingNote(topHighlight);
              noteProps.setNoteInput(topHighlight.note_content || "");
              noteProps.setIsEditingExistingNote(true);
              noteProps.setShowNoteModal(true);
            }}
            onMouseEnter={() => setHoveredNoteId(topHighlight.id)}
            onMouseLeave={() => setHoveredNoteId(null)}
          >
            {start === topHighlight.start_index && (
              <span 
                className="absolute -top-0.5 -left-0.5 w-0 h-0 border-t-[6px] border-l-[6px] border-t-red-500 border-l-transparent border-r-transparent border-b-transparent z-10"
                aria-hidden="true"
              />
            )}
            <span className={`rounded px-0.5 transition-colors duration-200 text-inherit ${isHovered ? 'bg-slate-300/60 dark:bg-slate-700/60' : 'bg-transparent'}`}>
              {segmentText}
            </span>
          </span>
        );
      } else {
        result.push(<span key={`${start}-${end}`}>{segmentText}</span>);
      }
    }
    return result;
  };

  const themeContainerClasses = `${currentTheme.container} ${currentTheme.text}`;
  const cardThemeClasses = currentTheme.paper;

  // Xử lý riêng Header vì nó có hiệu ứng kính mờ (backdrop/opacity)
  let headerThemeClasses = "bg-white/90 border-slate-200";
  if (themeMode === "dark") headerThemeClasses = "bg-slate-950/90 border-slate-800";
  else if (themeMode === "sepia") headerThemeClasses = "bg-[#e9dec5]/90 border-[#d5c7a3]";

  return (
    <div className={`min-h-screen flex w-full overflow-hidden select-none ${themeContainerClasses} theme-${themeMode}`}>
      
      {/* LEFTSIDEBAR */}
      <LeftSidebar 
        chapters={chapters}
        selectedChapter={selectedChapter}
        setSelectedChapter={setSelectedChapter}
        currentTheme={currentTheme}
        setShowUpgradeModal={setShowUpgradeModal}
        t={t}
      />

      {/*. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className={`h-14 shrink-0 border-b flex items-center justify-between px-6 z-10 ${headerThemeClasses}`}>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-black/5 dark:hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-sm line-clamp-1">{book?.title}</h1>
              <p className="text-xs opacity-70 line-clamp-1">{selectedChapter?.title}</p>
            </div>
          </div>
        </div>

        <div 
          ref={activeChapterRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scrollbar relative"
        >
          <div className="max-w-3xl w-full mx-auto px-6 py-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm opacity-70">{t("layout.readpage.loadingChapter", "Đang tải nội dung chương...")}</p>
              </div>
            ) : (
              <div 
                className={`p-8 md:p-12 rounded-xl border ${cardThemeClasses} ${readerSettings.fontFamily}`}
                style={{ fontSize: `${readerSettings.fontSize}px` }}
              >
                <h2 className="font-bold text-2xl md:text-3xl mb-8 border-b pb-4 border-inherit">
                  {selectedChapter?.title}
                </h2>
                <div 
                  ref={contentRef}
                  onMouseUp={() => noteProps.handleTextSelection(contentRef, selectedChapter?.content)}
                  className="whitespace-pre-wrap leading-relaxed tracking-wide select-text relative"
                >
                  {renderHighlightedText(selectedChapter?.content, noteProps.highlights)}
                </div>
              </div>
            )}
          </div>
        </div>

        {!loading && chapters?.length > 0 && (
          <div className={`h-16 shrink-0 border-t flex items-center justify-center px-6 z-10 ${headerThemeClasses}`}>
            <div className="max-w-3xl w-full">
              <Pagination
                // chapters={chapters}
                // selectedChapter={selectedChapter}
                // setSelectedChapter={setSelectedChapter}
                setShowUpgradeModal={setShowUpgradeModal}
                currentPage={currentPage}  
                totalPages={totalPages}      
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}

        {/* POPUP NOTE */}
        {noteProps.selectionBox && isAuthenticated && (
          <div
            className="fixed z-50 transform -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded shadow-xl flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors border border-slate-700"
            style={{ top: `${noteProps.selectionBox.top}px`, left: `${noteProps.selectionBox.left}px` }}
            onClick={() => {
              noteProps.setIsEditingExistingNote(false);
              noteProps.setShowNoteModal(true);
            }}
          >
            <span>{t("layout.readpage.note.addNote")}</span>
          </div>
        )}
      </div>

      {/* RIGHTSIDEBAR */}
      <RightSidebar 
        readerSettings={readerSettings}
        updateSetting={updateSetting}
        highlights={noteProps.highlights}
        handleJumpToNote={handleJumpToNote}
        currentTheme={currentTheme}
        isFullScreen={isFullScreen}
        toggleFullScreen={toggleFullScreen}
        bookTitle={book?.title}
        chapterId={selectedChapter?.id}
        t={t}
      />

      {/* MODAL CRUD NOTE */}
      <Dialog open={noteProps.showNoteModal} onOpenChange={noteProps.closeModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {noteProps.isEditingExistingNote ? t("layout.readpage.note.editNoteTitle") : t("layout.readpage.note.addNoteTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded text-slate-600 dark:text-slate-300 italic max-h-24 overflow-y-auto mt-2">
              "{noteProps.isEditingExistingNote ? noteProps.viewingNote?.selected_text : noteProps.currentNoteConfig?.selectedText}"
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <textarea
              className="w-full h-24 p-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 custom-scrollbar"
              placeholder={t("layout.readpage.note.notePlaceholder")}
              value={noteProps.noteInput}
              onChange={(e) => noteProps.setNoteInput(e.target.value)}
            />
          </div>

          <DialogFooter className="flex sm:justify-between items-center gap-2">
            {noteProps.isEditingExistingNote && (
              <Button variant="destructive" size="sm" onClick={noteProps.handleDeleteNote} className="dark:border-slate-700 dark:hover:bg-slate-800 hover:bg-red-600/20">
                {t("layout.readpage.note.deleteNote")}
              </Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={noteProps.closeModal} className="dark:border-slate-700 dark:hover:bg-slate-800 hover:bg-gray-300/20">
                {t("layout.readpage.note.cancelBtn")}
              </Button>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={noteProps.isEditingExistingNote ? noteProps.handleUpdateNote : noteProps.handleSaveNote}
              >
                {noteProps.isEditingExistingNote ? t("layout.readpage.note.updateNote") : t("layout.readpage.note.saveNote")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL NÂNG CẤP PREMIUM */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {t("layout.readpage.showUpgradeModal.dialogTitle")}
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {t("layout.readpage.showUpgradeModal.dialogDes1")} <br />
              {t("layout.readpage.showUpgradeModal.dialogDes2")} <strong>{t("layout.readpage.showUpgradeModal.dialogDes3")}</strong> {t("layout.readpage.showUpgradeModal.dialogDes4")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
              {t("layout.readpage.showUpgradeModal.laterBtn")}
            </Button>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => navigate('/membership')}>
              {t("layout.readpage.showUpgradeModal.upgradeBtn", "Nâng cấp ngay")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}