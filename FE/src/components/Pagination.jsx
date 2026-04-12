import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "" 
}) {
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [inputPage, setInputPage] = useState(String(currentPage));

  // Cập nhật giá trị input khi trang thay đổi từ bên ngoài
  useEffect(() => {
    if (!isEditingPage) {
      setInputPage(String(currentPage));
    }
  }, [currentPage, isEditingPage]);

  const handlePageJump = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    let targetPage = parseInt(inputPage, 10);
    
    // Validate
    if (isNaN(targetPage) || targetPage < 1) {
      targetPage = 1;
    }
    if (targetPage > totalPages) {
      targetPage = totalPages;
    }

    onPageChange(targetPage);
    setIsEditingPage(false);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 0) return null;

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <Button 
        variant="outline" 
        onClick={handlePrev} 
        disabled={currentPage <= 1} 
        className="flex gap-1 sm:gap-2 hover:bg-slate-100 h-9 px-2 sm:px-4"
      >
        <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Trước</span>
      </Button>

      <div className="text-sm text-slate-600 font-medium">
        {isEditingPage ? (
          <form onSubmit={handlePageJump} className="flex items-center gap-2">
            <span className="hidden sm:inline">Trang</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onBlur={handlePageJump}
              autoFocus
              className="w-16 h-8 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
            / {totalPages}
          </form>
        ) : (
          <span
            className="cursor-pointer hover:text-blue-600 hover:bg-blue-50 px-2 sm:px-3 py-1.5 rounded transition-all inline-block border border-transparent hover:border-blue-200 select-none"
            onClick={() => setIsEditingPage(true)}
            title="Bấm để nhập số trang"
          >
            Trang {currentPage} / {totalPages}
          </span>
        )}
      </div>

      <Button 
        variant="outline" 
        onClick={handleNext} 
        disabled={currentPage >= totalPages} 
        className="flex gap-1 sm:gap-2 hover:bg-slate-100 h-9 px-2 sm:px-4"
      >
        <span className="hidden sm:inline">Sau</span> <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}