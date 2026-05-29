import { useEffect, useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { useSelector } from "react-redux";
import HttpClient from "@/service/HttpClient";
import { firstValueFrom } from "rxjs";
import { toast } from "react-toastify";
import CommentMenu from "./CommentMenu";
import Pagination from "./Pagination";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export function ReviewsSection({ bookId, refreshKey }) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 5;
  const [editModal, setEditModal] = useState({
    open: false,
    commentId: null,
    content: "",
    rating: 1,
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    commentId: null,
  });
  const openEditModal = (commentId) => {
    const review = reviews.find((r) => r.id === commentId);
    setEditModal({
      open: true,
      commentId,
      content: review.comment,
      rating: review.rating,
    });
  };
  const openDeleteModal = (commentId) => {
    setDeleteModal({
      open: true,
      commentId,
    });
  };

  useEffect(() => {
    if (!bookId) return;
    
    const loadReviews = async () => {
      setLoading(true);
      try {
        const res = await firstValueFrom(
          HttpClient.get(`/comments/books/${bookId}/comments`, {
            search: { page: currentPage, limit: LIMIT } 
          })
        );
        const d = res.data;
        setReviews(
          (d?.comments || []).map((item) => ({
            id: item.comment_id,
            userId: item.user?.user_id,
            userName: item.user?.full_name || "Ẩn danh",
            rating: item.rating,
            comment: item.content,
            createdAt: item.created_at,
            status: item.status,
            likeCount: item.likeCount,
            userReaction: item.userReaction
          }))
        );
        setAverageRating(Number(d?.averageRating || 0));
        setTotalComments(d?.totalComments || 0);
        setTotalPages(d?.pagination?.totalPages || Math.ceil((d?.totalComments || 0) / LIMIT));
      } catch (error) {
        console.error("Lỗi load đánh giá:", error);
        setReviews([]);
        setAverageRating(0);
        setTotalComments(0);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [bookId, refreshKey, currentPage]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await firstValueFrom(
        HttpClient.put(`/comments/${editModal.commentId}`, {
          content: editModal.content,
          rating: Number(editModal.rating),
        })
      );
      
      const res = await firstValueFrom(
        HttpClient.get(`/comments/books/${bookId}/comments`)
      );
      const d = res.data;
      setReviews(
        (d?.comments || []).map((item) => ({
          id: item.comment_id,
          userId: item.user?.user_id,
          userName: item.user?.full_name || "Ẩn danh",
          rating: item.rating,
          comment: item.content,
          createdAt: item.created_at,
        }))
      );
      setAverageRating(Number(d?.averageRating || 0));
      setTotalComments(d?.totalComments || 0);
      toast.success(t("components.reviewsection.success.update"));
      setEditModal({ open: false, commentId: null, content: "", rating: 1 });
    } catch (err) {
      console.error("Lỗi cập nhật đánh giá:", err);
      toast.error("Đã xảy ra lỗi khi cập nhật đánh giá. Vui lòng thử lại.");
    }
  };

  const handleLike = async (commentId) => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để thao tác!");
      return;
    }
    try {
      await firstValueFrom(
        HttpClient.post(`/comments/${commentId}/react`, { type: 'LIKE' })
      );
      
      const res = await firstValueFrom(HttpClient.get(`/comments/books/${bookId}/comments`));
      const d = res.data;
      setReviews(
        (d?.comments || []).map((item) => ({
          id: item.comment_id,
          userId: item.user?.user_id,
          userName: item.user?.full_name || "Ẩn danh",
          rating: item.rating,
          comment: item.content,
          createdAt: item.created_at,
          likeCount: item.likeCount,
          userReaction: item.userReaction
        }))
      );
    } catch (err) {
      console.error("Lỗi thả tim:", err);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    try {
      await firstValueFrom(
        HttpClient.delete(`/comments/${deleteModal.commentId}`)
      );
      
      const res = await firstValueFrom(
        HttpClient.get(`/comments/books/${bookId}/comments`)
      );
      const d = res.data;
      setReviews(
        (d?.comments || []).map((item) => ({
          id: item.comment_id,
          userId: item.user?.user_id,
          userName: item.user?.full_name || "Ẩn danh",
          rating: item.rating,
          comment: item.content,
          createdAt: item.created_at,
        }))
      );
      setAverageRating(Number(d?.averageRating || 0));
      setTotalComments(d?.totalComments || 0);
      toast.success(t("components.reviewsection.success.delete"));
      setDeleteModal({ open: false, commentId: null });
    } catch (err) {
      console.error("Lỗi xóa đánh giá:", err);
      toast.error("Đã xảy ra lỗi khi xóa đánh giá. Vui lòng thử lại.");
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{t("components.reviewsection.loading")}</p>
      </div>
    );
  }

  if (!loading && reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{t("components.reviewsection.noReview")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average Rating Summary */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{averageRating}</div>
            <div className="flex gap-1 mt-2 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              ({totalComments} {t("components.reviewsection.reviewCount")})
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4 bg-slate-50 dark:bg-zinc-900/50 p-4 sm:p-6 rounded-xl">
        <h3 className="font-semibold text-lg">{t("components.reviewsection.reviewsTitle")}</h3>
        <hr className="my-2 border-gray-300 dark:border-zinc-700" />
        {reviews.map((review) => {
          const currentUserId = user?.userId || user?.user_id;
          const isCurrentUser = user && (String(review.userId) === String(currentUserId));
          const displayName = isCurrentUser
            ? (user.fullName || user.full_name)
            : review.userName;

          return (
            <div key={review.id} className="py-4 border-b last:border-b-0 border-gray-200 dark:border-zinc-800">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {displayName}
                    {isCurrentUser && ` ${t("components.reviewsection.mentionUser")}`}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("vi-VN")
                      : ""}
                  </p>
                  {isCurrentUser && (
                    <CommentMenu
                      commentId={review.id}
                      onEdit={() => openEditModal(review.id)}
                      onDelete={() => openDeleteModal(review.id)}
                    />
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-foreground mt-2">{review.comment}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <button 
                  onClick={() => handleLike(review.id)}
                  className={`flex items-center gap-1 transition-colors ${
                    review.userReaction === 'LIKE' ? 'text-blue-600' : 'hover:text-blue-600'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${review.userReaction === 'LIKE' ? 'fill-current' : ''}`} />
                  <span> ({review.likeCount || 0})</span>
                </button>
              </div>
            </div>
          );
        })}
        {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
      </div>
      <Dialog open={editModal.open} onOpenChange={open => setEditModal(m => ({ ...m, open }))}>
        <DialogContent>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{t("components.reviewsection.dialogTitleEdit")}</DialogTitle>
            </DialogHeader>
            <div>
              <label className="block text-sm mb-1">{t("components.reviewsection.dialogLabelEdit")}</label>
              <textarea
                id="edit-comment-content"
                name="content"
                className="w-full border rounded p-2"
                rows={3}
                value={editModal.content}
                onChange={e => setEditModal(modal => ({ ...modal, content: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">{t("components.reviewsection.starLabel")}</label>
              <input
                id="edit-comment-rating"
                name="rating"
                type="number"
                min={1}
                max={5}
                className="w-16 border rounded p-1"
                value={editModal.rating}
                onChange={e => setEditModal(modal => ({ ...modal, rating: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setEditModal({ open: false, commentId: null, content: "", rating: 1 })}
                >
                  {t("components.reviewsection.cancelBtn")}
                </button>
              </DialogClose>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {t("components.reviewsection.saveBtn")}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteModal.open} onOpenChange={open => setDeleteModal(m => ({ ...m, open }))}>
        <DialogContent>
          <form onSubmit={handleDeleteSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{t("components.reviewsection.submitDeleteTitle")}</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              {t("components.reviewsection.submitDeleteDescription")}
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setDeleteModal({ open: false, commentId: null })}
                >
                  {t("components.reviewsection.cancelBtn")}
                </button>
              </DialogClose>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              >
                {t("components.reviewsection.deleteBtn")}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}