import { useState, useEffect } from "react";
import HttpClient from "@/service/HttpClient";
import { firstValueFrom } from "rxjs";
import { toast } from "react-toastify";

export default function useChapterNotes(chapterId, isAuthenticated, t) {
  const [highlights, setHighlights] = useState([]);
  const [selectionBox, setSelectionBox] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteConfig, setCurrentNoteConfig] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [isEditingExistingNote, setIsEditingExistingNote] = useState(false);
  const [selectedColor, setSelectedColor] = useState("bg-yellow-300");

  useEffect(() => {
    const fetchNotes = async () => {
      if (!chapterId || !isAuthenticated) return;
      try {
        const res = await firstValueFrom(HttpClient.get(`/chapter-notes/chapter/${chapterId}`));
        if (res && res.success) {
        setHighlights(res.data || []);        }
      } catch (error) {
        console.error("Lỗi tải ghi chú:", error);
      }
    };
    fetchNotes();
  }, [chapterId, isAuthenticated]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionBox(null);
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleTextSelection = (contentRef, rawText) => {
    const selection = window.getSelection();
    // Lấy chuỗi được bôi đen
    const text = selection.toString();

    if (!selection || selection.isCollapsed || text.trim().length < 2) {
      setSelectionBox(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(contentRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    
    const domStartIndex = preSelectionRange.toString().length;
    const cleanText = text.replace(/\r\n/g, '\n');
    
    // THUẬT TOÁN TÌM VỊ TRÍ CHÍNH XÁC (Tự động bù trừ sai số)
    // 1. Tìm chuỗi khớp 100% ở quanh khu vực DOM Index
    let exactStartIndex = rawText.indexOf(cleanText, Math.max(0, domStartIndex - 50));
    
    // 2. Nếu không thấy, quét từ đầu trang
    if (exactStartIndex === -1) {
        exactStartIndex = rawText.indexOf(cleanText);
    }
    
    // 3. Fallback: Nếu HTML chèn tag lạ, tìm mỏ neo 15 ký tự đầu
    if (exactStartIndex === -1) {
        const startAnchor = cleanText.substring(0, 15);
        exactStartIndex = rawText.indexOf(startAnchor, Math.max(0, domStartIndex - 50));
    }

    // 4. Nếu mọi cách đều thất bại, dùng tạm DOM Index
    if (exactStartIndex === -1) exactStartIndex = domStartIndex;

    const exactEndIndex = exactStartIndex + cleanText.length;

    setCurrentNoteConfig({ 
      startIndex: exactStartIndex, 
      endIndex: exactEndIndex, 
      selectedText: cleanText 
    });
    
    setSelectionBox({ top: rect.top - 50, left: rect.left + rect.width / 2 });
  };

  const handleSaveNote = async () => {
    try {
      const payload = {
        chapter_id: chapterId,
        start_index: currentNoteConfig.startIndex,
        end_index: currentNoteConfig.endIndex,
        selected_text: currentNoteConfig.selectedText,
        note_content: noteInput,
        color: selectedColor
      };      
      const res = await firstValueFrom(HttpClient.post(`/chapter-notes`, payload));
      if (res && res.success) {
        setHighlights(prev => [...prev, res.data]);
        closeModal();
        toast.success(t("api.notes.saveSuccess", "Đã lưu ghi chú!"));
      }
    } catch (error) {
      toast.error(t("api.errors.DEFAULT_ERROR", "Lỗi lưu ghi chú"));
    }
  };

  const handleUpdateNote = async () => {
    try {
      const res = await firstValueFrom(HttpClient.put(`/chapter-notes/${viewingNote.id}`, {
         note_content: noteInput,
         color: selectedColor
      })); 
      if (res && res.success) {
        setHighlights(prev => prev.map(n => n.id === viewingNote.id ? { ...n, note_content: noteInput, color: selectedColor } : n));
        closeModal();
        toast.success(t("api.notes.updateSuccess", "Đã cập nhật!"));
      }
    } catch (error) {
      toast.error(t("api.errors.DEFAULT_ERROR", "Lỗi cập nhật"));
    }
  };

  const handleDeleteNote = async () => {
    if (!window.confirm(t("layout.readpage.confirmDeleteNote", "Xóa ghi chú này?"))) return;
    try {
      const res = await firstValueFrom(HttpClient.delete(`/chapter-notes/${viewingNote.id}`));
      if (res && res.success) {
        setHighlights(prev => prev.filter(n => n.id !== viewingNote.id));
        closeModal();
        toast.success(t("api.notes.deleteSuccess", "Đã xóa!"));
      }
    } catch (error) {
      toast.error(t("api.errors.DEFAULT_ERROR", "Lỗi xóa ghi chú"));
    }
  };

  const closeModal = () => {
    setShowNoteModal(false);
    setViewingNote(null);
    setNoteInput("");
    setIsEditingExistingNote(false);
    setSelectionBox(null);
  };

  return {
    highlights, selectionBox, setSelectionBox, showNoteModal, setShowNoteModal,
    viewingNote, setViewingNote, noteInput, setNoteInput, isEditingExistingNote, setIsEditingExistingNote,
    handleTextSelection, handleSaveNote, handleUpdateNote, handleDeleteNote, closeModal, currentNoteConfig,
    selectedColor, setSelectedColor
  };
}