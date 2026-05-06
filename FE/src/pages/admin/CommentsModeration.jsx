import React, { useState, useEffect } from 'react';
import { Star, Loader2, Trash2 } from 'lucide-react';
import { firstValueFrom } from 'rxjs';
import HttpClient from "../../service/HttpClient";

const AdminCommentService = {
  getAllComments: async (params) => {
    const res = await firstValueFrom(HttpClient.get('/comments', { params }));
    return res?.data;
  },
  deleteComment: async (id) => {
    return await firstValueFrom(HttpClient.delete(`/comments/${id}`));
  }
};

export default function CommentsModeration() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await AdminCommentService.getAllComments({ limit: 50 });
      setComments(res?.comments || []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này khỏi hệ thống?")) {
      try {
        await AdminCommentService.deleteComment(id);
        setComments(prev => prev.filter(c => c.comment_id !== id));
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

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex flex-col gap-4 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Quản lý Bình luận
              <span className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded">
                {comments.length}
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">Xem và quản lý tất cả bình luận trên hệ thống</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-0">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : comments.length === 0 ? (
          <div className="text-center p-8 text-slate-500">Không có bình luận nào</div>
        ) : comments.map((c) => (
          <div key={c.comment_id} className="p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-slate-900 dark:text-white">{c.user?.full_name || 'Người dùng ẩn'}</span>
                <span className="text-xs text-slate-500">• Sách: "{c.book?.title || 'Unknown'}"</span>
              </div>
              <span className="text-xs text-slate-400">{getTimeAgo(c.created_at)}</span>
            </div>
            
            <div className="mb-2 flex">
              {[...Array(c.rating || 0)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300">{c.content}</p>
            
            {/* Giữ lại tag Sentiment */}
            {c.sentiment && (
              <div className="mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  c.sentiment === 'POSITIVE' ? 'bg-green-50 text-green-600 border-green-200' :
                  c.sentiment === 'NEGATIVE' ? 'bg-red-50 text-red-600 border-red-200' :
                  'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {c.sentiment}
                </span>
              </div>
            )}
            
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleDelete(c.comment_id)}
                className="px-3 py-1 text-xs rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-1 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} /> Xóa bình luận
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}