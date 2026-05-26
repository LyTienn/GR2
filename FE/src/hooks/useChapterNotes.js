import { useState, useEffect } from "react";
import HttpClient from "@/service/HttpClient";
import { firstValueFrom } from "rxjs";
import { toast } from "react-toastify";

export default function useChapterNotes(bookId, chapterId, isAuthenticated, t) {
  const [highlights, setHighlights] = useState([]);
  const [selectionBox, setSelectionBox] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteConfig, setCurrentNoteConfig] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [isEditingExistingNote, setIsEditingExistingNote] = useState(false);

  // #region fetch notes theo book
  useEffect(() => {
    const fetchNotes = async () => {
      if (!bookId || !isAuthenticated) return;
      try {
        const res = await firstValueFrom(HttpClient.get(`/chapter-notes/book/${bookId}`));
        if (res && res.success) setHighlights(res.data || []);
      } catch (error) {
        console.error("Lỗi tải ghi chú:", error);
      }
    };
    fetchNotes();
  }, [bookId, isAuthenticated]);

  // useEffect(() => {
  //   const fetchNotes = async () => {
  //     if (!chapterId || !isAuthenticated) return;
  //     try {
  //       const res = await firstValueFrom(HttpClient.get(`/chapter-notes/chapter/${chapterId}`));
  //       if (res && res.success) {
  //       setHighlights(res.data || []);        }
  //     } catch (error) {
  //       console.error("Lỗi tải ghi chú:", error);
  //     }
  //   };
  //   fetchNotes();
  // }, [chapterId, isAuthenticated]);

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
    const normalizedRawText = rawText.replace(/\r\n/g, '\n');
    let exactStartIndex = normalizedRawText.indexOf(cleanText, Math.max(0, domStartIndex - 50));
    
    if (exactStartIndex === -1) {
        exactStartIndex = normalizedRawText.indexOf(cleanText);
    }
    
    if (exactStartIndex === -1) {
        const startAnchor = cleanText.substring(0, 15);
        exactStartIndex = normalizedRawText.indexOf(startAnchor, Math.max(0, domStartIndex - 50));
    }

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
      };      
      const res = await firstValueFrom(HttpClient.post(`/chapter-notes`, payload));
      if (res && res.success) {
        const newNote = { ...res.data, chapter: { id: chapterId } };
        setHighlights(prev => [...prev, newNote]);
        closeModal();
        toast.success(t("layout.readpage.note.saveSuccess"));
      }
    } catch (error) {
      toast.error(t("layout.readpage.note.saveError"));
    }
  };

  const handleUpdateNote = async () => {
    try {
      const res = await firstValueFrom(HttpClient.put(`/chapter-notes/${viewingNote.id}`, {
         note_content: noteInput,
      })); 
      if (res && res.success) {
        setHighlights(prev => prev.map(n => n.id === viewingNote.id ? { ...n, note_content: noteInput } : n));
        closeModal();
        toast.success(t("layout.readpage.note.updateSuccess"));
      }
    } catch (error) {
      toast.error(t("layout.readpage.note.updateError"));
    }
  };

  const handleDeleteNote = async () => {
    if (!window.confirm(t("layout.readpage.note.confirmDeleteNote"))) return;
    try {
      const res = await firstValueFrom(HttpClient.delete(`/chapter-notes/${viewingNote.id}`));
      if (res && res.success) {
        setHighlights(prev => prev.filter(n => n.id !== viewingNote.id));
        closeModal();
        toast.success(t("layout.readpage.note.deleteSuccess"));
      }
    } catch (error) {
      toast.error(t("layout.readpage.note.deleteError"));
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
  };
}