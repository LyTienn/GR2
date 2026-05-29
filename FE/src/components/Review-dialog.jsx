import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { Star, StarHalf, MessageCircle } from "lucide-react";
import { firstValueFrom } from "rxjs";
import HttpClient from "@/service/HttpClient";
import { useTranslation } from "react-i18next";

const ReviewDialog = ({ bookId, onReviewAdded }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            toast.error(t("layout.bookdetailpage.loginToAssess"));
            return;
        }

        if (rating === 0) {
            toast.error("Vui lòng chọn đánh giá sao.");
            return;
        }
        
        setSubmitting(true);
        try {
            await firstValueFrom(
                HttpClient.post(`/comments/books/${bookId}/comments`, {
                    rating: rating,
                    content: comment,
                }, { skipToast: true })
            );
            toast.success(t("components.reviewdialog.success.create"));
            setIsOpen(false);
            setRating(0);
            setComment("");
            if (onReviewAdded) {
                onReviewAdded();
            }
        } catch (err) {
            console.error("Lỗi gửi đánh giá:", err);
            const message = err.response?.message || err.message;
            const errorMap = {
                "You have already commented on this book": t("components.reviewdialog.error.alreadyCommented"),
            };
            const errorMessage = errorMap[message] || t("components.reviewdialog.error.submitFailed");
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-50% gap-2 hover:bg-gray-100" size="lg">
                    <MessageCircle className="h-4 w-4" />
                    {t("components.reviewdialog.reviewBtn")}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("components.reviewdialog.dialogTitle")}</DialogTitle>
                    <DialogDescription>
                        {t("components.reviewdialog.dialogDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2 flex flex-col items-center">
                        <span className="text-sm font-medium text-muted-foreground">{t("components.reviewdialog.selectRating")}</span>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`h-10 w-10 transition-colors duration-200 ${
                                            (hoverRating || rating) >= star
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-slate-200 fill-slate-100"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="h-5 text-sm font-medium text-yellow-600">
                            { hoverRating === 1 && t("components.reviewdialog.hoverRating.1") }
                            { hoverRating === 2 && t("components.reviewdialog.hoverRating.2") }
                            { hoverRating === 3 && t("components.reviewdialog.hoverRating.3") }
                            { hoverRating === 4 && t("components.reviewdialog.hoverRating.4") }
                            { hoverRating === 5 && t("components.reviewdialog.hoverRating.5") }
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("components.reviewdialog.labelComment")}</label>
                        <Textarea
                            placeholder={t("components.reviewdialog.placeholderComment")}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                    
                    <Button 
                        onClick={handleSubmit} 
                        disabled={rating === 0 || submitting} 
                        className="w-full hover:bg-slate-100"
                    >
                        {submitting ? t("components.reviewdialog.submitLoading") : t("components.reviewdialog.submitBtn")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ReviewDialog;