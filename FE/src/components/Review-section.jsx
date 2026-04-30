import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useSelector } from "react-redux";
import HttpClient from "@/service/HttpClient";
import { firstValueFrom } from "rxjs";
import { toast } from "react-toastify";
import CommentMenu from "./CommentMenu";
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
            status: item.status,
          }))
        );
        setAverageRating(Number(d?.averageRating || 0));
        setTotalComments(d?.totalComments || 0);
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
  }, [bookId, refreshKey]);

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
      toast.success("Cập nhật đánh giá thành công!");
      setEditModal({ open: false, commentId: null, content: "", rating: 1 });
    } catch (err) {
      console.error("Lỗi cập nhật đánh giá:", err);
      toast.error("Đã xảy ra lỗi khi cập nhật đánh giá. Vui lòng thử lại.");
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
      toast.success("Xóa đánh giá thành công!");
      setDeleteModal({ open: false, commentId: null });
    } catch (err) {
      console.error("Lỗi xóa đánh giá:", err);
      toast.error("Đã xảy ra lỗi khi xóa đánh giá. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{t("components.reviewsection.loading")}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
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
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{t("components.reviewsection.reviewsTitle")}</h3>
        {reviews.map((review) => {
          const currentUserId = user?.userId || user?.user_id;
          const isCurrentUser = user && (String(review.userId) === String(currentUserId));
          const displayName = isCurrentUser
            ? (user.fullName || user.full_name)
            : review.userName;

          return (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {displayName}
                    {isCurrentUser && ` ${t("components.reviewsection.mentionUser")}`}
                    {/* {review.status === 'PENDING' && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200 font-normal">
                        Đang chờ duyệt
                      </span>
                    )} */}
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
            </div>
          );
        })}
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