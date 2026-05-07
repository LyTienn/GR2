import React, { useState, useEffect } from 'react';
import { Star, Loader2, Trash2, Search, BookOpen, MessageSquare } from 'lucide-react';
import { firstValueFrom } from 'rxjs';
import HttpClient from "../../service/HttpClient";

export default function CommentsModeration() {

  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingBooks, setLoadingBooks] = useState(false);
  
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoadingBooks(true);
        const res = await firstValueFrom(HttpClient.get('/comments/books-with-comments', { params: { limit: 100 } }));
        setBooks(res?.data?.data || res?.data || []);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const params = { limit: 50 }; 
        if (selectedBook) {
          params.bookId = selectedBook.id;
        }
        
        const res = await firstValueFrom(HttpClient.get('/comments', { params }));
        const commentsData = res?.data?.data?.comments || res?.data?.comments || [];
        setComments(commentsData);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setLoadingComments(false);
      }
    };
    fetchComments();
  }, [selectedBook]);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này khỏi hệ thống?")) {
      try {
        await firstValueFrom(HttpClient.delete(`/comments/${id}`));
        setComments(prev => prev.filter(c => c.comment_id !== id));
        
        if (selectedBook) {
           setBooks(prevBooks => prevBooks.map(b => 
             b.id === selectedBook.id ? { ...b, commentCount: Number(b.commentCount) - 1 } : b
           ));
        }
      } catch (error) {
        alert("Lỗi khi xóa bình luận");
      }
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const filteredBooks = books.filter(b => b.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-70px)] min-h-[calc(100vh-100px)] gap-4 lg:gap-6 p-4 lg:p-6 bg-slate-50 dark:bg-[#0f111a]">
      <div className="w-full lg:w-1/3 xl:w-1/4 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[400px] lg:h-full shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200">
            <BookOpen size={18} /> Lọc theo sách
          </h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            onClick={() => setSelectedBook(null)}
            className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors flex items-center gap-3 border ${
              selectedBook === null
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 font-medium'
                : 'bg-white border-transparent hover:bg-slate-50 text-slate-700 dark:bg-transparent dark:hover:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <div className={`p-2 rounded-md ${selectedBook === null ? 'bg-blue-100 dark:bg-blue-800/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <MessageSquare size={16} />
            </div>
            <div className="flex-1 font-semibold">Tất cả bình luận</div>
          </button>

          <hr className="my-2 border-slate-100 dark:border-slate-800" />

          {loadingBooks ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <button
                key={book.id}
                onClick={() => setSelectedBook(book)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 border ${
                  selectedBook?.id === book.id
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 font-medium'
                    : 'bg-white border-transparent hover:bg-slate-50 text-slate-600 dark:bg-transparent dark:hover:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <img src={book.cover_image || 'https://placehold.co/40x60'} alt="" className="w-8 h-10 object-cover rounded shadow-sm" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{book.title}</div>
                  <div className="text-xs mt-0.5 opacity-70">{book.commentCount || 0} bình luận</div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy sách.</div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/50 flex flex-col gap-1 shrink-0 bg-slate-50/50 dark:bg-slate-900/20">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {selectedBook ? `Bình luận: ${selectedBook.title}` : 'Tất cả bình luận'}
            <span className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {comments.length}
            </span>
          </h2>
          <p className="text-sm text-slate-500">
            {selectedBook ? 'Xem và quản lý phản hồi của người dùng cho sách này.' : 'Quản lý toàn bộ luồng đánh giá trên hệ thống.'}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0">
          {loadingComments ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
               <MessageSquare size={48} className="mb-4 opacity-20" />
               <p>Không có bình luận nào để hiển thị.</p>
            </div>
          ) : comments.map((c) => (
            <div key={c.comment_id} className="p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {c.user?.full_name || 'Người dùng ẩn'}
                    </span>
                    {!selectedBook && (
                       <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded line-clamp-1 max-w-[200px]">
                         📚 {c.book?.title || 'Unknown'}
                       </span>
                    )}
                  </div>
                  <div className="flex mt-1.5">
                    {[...Array(c.rating || 0)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-slate-400">{getTimeAgo(c.created_at)}</span>
                  <button
                    onClick={() => handleDelete(c.comment_id)}
                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 px-2 py-1.5 text-xs rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-1 hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={14} /> Xóa
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">{c.content}</p>
              
              {c.sentiment && (
                <div className="mt-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                    c.sentiment === 'POSITIVE' ? 'bg-green-50 text-green-600 border-green-200' :
                    c.sentiment === 'NEGATIVE' ? 'bg-red-50 text-red-600 border-red-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {c.sentiment}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}