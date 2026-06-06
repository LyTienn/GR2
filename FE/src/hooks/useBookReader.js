import { useState, useEffect, useRef } from 'react';        
import { firstValueFrom } from 'rxjs';
import HttpClient from "@/service/HttpClient"; 
import { toast } from "react-toastify";

const isChapterLocked = (chapter) => Boolean(chapter?.isLocked || chapter?.is_premium);

export default function useBookReader(bookId, isAuthenticated, t) {
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [initialScrollPos, setInitialScrollPos] = useState(0);
  
  const isAddingToBookshelf = useRef(false);

  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;

    const loadAllData = async () => {
      setLoading(true);
      isAddingToBookshelf.current = false;
      try {
        const [resBook, resChapters] = await Promise.all([
          firstValueFrom(HttpClient.get(`/books/${bookId}`)),
          firstValueFrom(HttpClient.get(`/books/${bookId}/chapters`)).catch(() => null)
        ]);

        if (cancelled) return;
        setBook(resBook?.data ?? resBook);

        let finalChapters = [];
        if (resChapters) {
          const rawChaps = resChapters.data ?? resChapters;
          if (Array.isArray(rawChaps)) finalChapters = rawChaps;
          else if (rawChaps?.data && Array.isArray(rawChaps.data)) finalChapters = rawChaps.data;
          else if (rawChaps?.data?.data && Array.isArray(rawChaps.data.data)) finalChapters = rawChaps.data.data;
        }
        setChapters(finalChapters);

        const firstReadableChapter = finalChapters.find(ch => !isChapterLocked(ch)) ?? finalChapters[0] ?? null;
        let chapterToLoad = firstReadableChapter;
        let scrollPosToLoad = 0;

        if (isAuthenticated) {
          try {
            const checkResponse = await firstValueFrom(HttpClient.get(`/bookshelf/books/${bookId}/check`));

            if (checkResponse.data?.isReading) {
              try {
                const resProgress = await firstValueFrom(HttpClient.get(`/bookshelf/books/${bookId}/progress`));
                if (resProgress?.data) {
                  const { lastChapterId, lastReadScrollPosition } = resProgress.data;
                  if (lastChapterId) {
                    const savedChapter = finalChapters.find(ch => ch.id === lastChapterId);
                    if (savedChapter && isChapterLocked(savedChapter)) {
                      chapterToLoad = firstReadableChapter;
                      scrollPosToLoad = 0;
                      setShowUpgradeModal(true);
                    } else {
                      chapterToLoad = savedChapter || chapterToLoad;
                      if (lastReadScrollPosition != null) scrollPosToLoad = lastReadScrollPosition;
                      
                      toast.info(`${t("toasts.info.continueReading")} ${chapterToLoad?.title ?? ''}`, {
                        autoClose: 2000,
                        toastId: 'resume-toast'
                      });
                    }
                  }
                }
              } catch (progressErr) {
                console.log("Không có tiến độ cũ:", progressErr);
              }
            } else {
              if (!isAddingToBookshelf.current) {
                isAddingToBookshelf.current = true;
                try {
                  await firstValueFrom(HttpClient.post(`/bookshelf/books/${bookId}`, { bookId, status: 'READING' }));
                } catch (addErr) {
                  if (addErr.response?.status !== 409) console.error("Lỗi khi thêm sách:", addErr);
                }
              }
            }
          } catch (bookshelfErr) {
            console.error("Lỗi xử lý bookshelf:", bookshelfErr);
          }
        }

        if (cancelled) return;
        setSelectedChapter(chapterToLoad);
        setInitialScrollPos(scrollPosToLoad);

      } catch (err) {
        if (cancelled) return;
        console.error("Lỗi tải dữ liệu:", err);
        toast.error(t("toasts.error.loadBookData"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAllData();
  }, [bookId, isAuthenticated, t]);

  return {
    book,
    chapters,
    selectedChapter,
    setSelectedChapter,
    loading,
    showUpgradeModal,
    setShowUpgradeModal,
    initialScrollPos
  };
}
