import React from 'react';
import { BookOpen } from "lucide-react";

export default function NotesPanel({ highlights, handleJumpToNote, t }) {
  if (!highlights || highlights.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400 h-full opacity-70">
        <BookOpen className="w-12 h-12 mb-3" />
        <p className="text-sm italic">{t("layout.readpage.emptyNotesList", "Chưa có ghi chú nào trong sách này.")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      {highlights.map((note) => (
        <div 
          key={note.id} 
          onClick={() => handleJumpToNote(note)}
          className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-black/5 dark:hover:bg-white/25 cursor-pointer transition-all group"
        >
          <div className="flex items-start mb-2 relative">
            <span 
              className="mt-1.5 mr-2 shrink-0 w-0 h-0 border-t-[6px] border-l-[6px] border-t-red-500 border-l-transparent border-r-transparent border-b-transparent" 
              aria-hidden="true" 
            />
            <p className="text-sm font-medium line-clamp-3 text-inherit opacity-90 group-hover:opacity-100 transition-opacity">
              {note.selected_text}
            </p>
          </div>
          
          <div className="ml-3.5 pl-3 border-l-2 border-slate-300 dark:border-slate-600">
            {note.note_content ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                {note.note_content}
              </p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic opacity-70">
                {t("layout.readpage.highlightOnlyFallback", "(Chỉ đánh dấu)")}
              </p>
            )}
          </div>

          {note.chapter?.title && (
            <p className="text-[11px] text-right mt-2 text-slate-400 uppercase font-semibold tracking-wider">
              {note.chapter.title}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}