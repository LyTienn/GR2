import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Heart, BookOpen, Share2, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookCard from "@/components/BookCard";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import HeaderBar from "../components/HeaderBar";
import HttpClient from "@/service/HttpClient";
// import { firstValueFrom } from "rxjs";
import { useSelector } from "react-redux";
import { ReviewsSection } from "@/components/Review-section";
import ReviewDialog from "@/components/Review-dialog";
import { useTranslation } from "react-i18next";

export default function BookSection({ book: bookProp }) {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [book, setBook] = useState(bookProp || null);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [similarBooks, setSimilarBooks] = useState([]);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
  if (!bookProp && params.id) {
    setLoading(true);
    const subscription = HttpClient.get(`/books/${params.id}`)
      .subscribe({
        next: (res) => {
          setBook(res.data ?? res);
        },
        error: (error) => {
          console.error("Lỗi load sách:", error);
          setBook(null);
        },
        complete: () => {
          setLoading(false);
        }
      });
    
      return () => subscription.unsubscribe();
    }
  }, [params.id, bookProp]);

  useEffect(() => {
    if (isAuthenticated && book?.id) {
      const subscription = HttpClient.get(`/bookshelf/books/${book.id}/check`)
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              setIsFavorite(res.data.isFavorite);
            }
          },
          error: (error) => {
            console.error("Lỗi check status:", error);
          }
        });

      return () => subscription.unsubscribe();
    }
  }, [isAuthenticated, book?.id]);

  useEffect(() => {
    if (book?.id) {
      const subscription = HttpClient.get(`/books/${book.id}/similar`).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            setSimilarBooks(res.data);
          }
        },
        error: (err) => console.error("Lỗi lấy sách tương tự:", err)
      });
      return () => subscription.unsubscribe();
    }
  }, [book?.id]);

  if (!book) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Chọn một cuốn sách để xem chi tiết
      </div>
    );
  }

  // LOGIC 3: Xử lý Toggle
  const handleToggleFavorite = async () => {
  if (!isAuthenticated) {
    toast.error(t("toasts.error.loginToContinue"));
    return;
  }

  const previousState = isFavorite;
  setIsFavorite(!isFavorite);

  try {
    if (previousState) {
      HttpClient.delete(`/bookshelf/books/${book.id}?status=FAVORITE`)
        .subscribe({
          next: () => {
            toast.success(t("toasts.success.toggleFavorite.remove"));
            window.dispatchEvent(new Event("bookshelf-updated"));
          },
          error: (error) => {
            setIsFavorite(previousState);
            toast.error(error.message || "Đã có lỗi xảy ra.");
          }
        });
    } else {
      HttpClient.post(`/bookshelf/books/${book.id}`, { status: "FAVORITE" })
        .subscribe({
          next: () => {
            toast.success(t("toasts.success.toggleFavorite.add"));
            window.dispatchEvent(new Event("bookshelf-updated"));
          },
          error: (error) => {
            setIsFavorite(previousState);
            toast.error(error.message || "Đã có lỗi xảy ra.");
          }
        });
    }
  } catch (error) {
    setIsFavorite(previousState);
    toast.error(error.message || "Đã có lỗi xảy ra.");
  }
};

  const handleReadBook = () => {
    if (!isAuthenticated) {
      toast.error(t("toasts.error.loginToContinue"));
      return;
    }
    if (book?.id) {
      navigate(`/book/${book.id}/read`);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success(t("toasts.success.handleCopyLink"));
    setShareDialogOpen(false)
  }

  const handleShareSocial = (platform) => {
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(book?.title || "")
    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      // case "twitter":
      //   shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`
      //   break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
      case "zalo":
        shareUrl = `https://zalo.me/share?url=${url}&text=${title}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
      setShareDialogOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderBar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/search")} className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:font-medium transition-colors">
              {t("layout.bookdetailpage.breadcrumb.home")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium line-clamp-1">{book.title}</span>
          </nav>
        </div>
        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <div>
            <div className="relative aspect-2/3 rounded-lg overflow-hidden mb-4">
              <img src={book.imageUrl || book.image_url} alt={book?.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="space-y-2">
              <Button className="w-full hover:bg-gray-100" size="lg" onClick={handleReadBook}>
                <BookOpen className="h-4 w-4 mr-2" />
                {t("layout.bookdetailpage.readBtn")}
              </Button>
            </div>
          </div>
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 text-balance">{book.title}</h1>
                <p className="text-xl text-muted-foreground mb-4">{book.author?.name || book.author}</p>
                <div className="text-sm text-muted-foreground mb-4 relative">
                  <span
                    className={
                      showFullSummary
                        ? ""
                        : "line-clamp-2"
                    }
                  >
                    {book.summary}
                  </span>
                  {book.summary && book.summary.length > 120 && (
                    <button
                      className="ml-2 font-bold hover:underline bg-transparent border-none p-0 inline cursor-pointer"
                      style={{ fontSize: "inherit" }}
                      onClick={() => setShowFullSummary((prev) => !prev)}
                    >
                      {showFullSummary ? t("layout.bookdetailpage.hideSummaryBtn") : t("layout.bookdetailpage.showSummaryBtn")}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button className='hover:bg-gray-200' variant={isFavorite ? "default" : "outline"} size="icon" onClick={handleToggleFavorite}>
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className='hover:bg-gray-200' variant="outline" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("layout.bookdetailpage.dialogShare.title")}</DialogTitle>
                      <DialogDescription>{t("layout.bookdetailpage.dialogShare.titleleft")} "{book.title}" {t("layout.bookdetailpage.dialogShare.titleright")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Button
                        onClick={handleCopyLink}
                        variant="outline"
                        className='w-full justify-start bg-transparent hover:bg-gray-100'
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        {t("layout.bookdetailpage.dialogShare.copyLinkBtn")}
                      </Button>
                      <Button
                        onClick={() => handleShareSocial("facebook")}
                        variant="outline"
                        className="w-full justify-start hover:bg-gray-100"
                      >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        {t("layout.bookdetailpage.dialogShare.shareFacebookBtn")}
                      </Button>
                      {/* <Button
                        onClick={() => handleShareSocial("twitter")}
                        variant="outline"
                        className="w-full justify-start hover:bg-gray-100"
                      >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        {t("layout.bookdetailpage.dialogShare.shareTwitterBtn")}
                      </Button> */}
                      <Button
                        onClick={() => handleShareSocial("zalo")}
                        variant="outline"
                        className="w-full justify-start hover:bg-gray-100"
                      >
                        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Zalo</title><path d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z"/></svg>
                        {t("layout.bookdetailpage.dialogShare.shareZaloBtn")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                {book.type === 'FREE' ? (
                  <Badge className="bg-green-400">{t("layout.searchpage.sidebar.filterSection.bookTypeChoice.free")}</Badge>
                ) : (
                  <Badge className='bg-yellow-300' variant="secondary">{t("layout.searchpage.sidebar.filterSection.bookTypeChoice.premium")}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {similarBooks.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-6">{t("layout.bookdetailpage.maybeLikeTitle")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {similarBooks.map((simBook) => (
                <div key={simBook.id} className="cursor-pointer transition-transform hover:-translate-y-1" onClick={() => window.scrollTo(0, 0)}>
                  <BookCard book={simBook} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-8">
          <div className="mb-6">
            {isAuthenticated ? (
              <ReviewDialog
                bookId={book.id}
                onReviewAdded={() => setReviewRefreshKey((prev) => prev + 1)}

              />
            ) : (
              <div className="text-center py-8 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-4">{t("layout.bookdetailpage.loginToAssess")}</p>
                <Button className="hover:bg-slate-100" onClick={() => navigate("/login")}>{t("layout.header.login")}</Button>
              </div>
            )}
          </div>
          <ReviewsSection bookId={book.id} refreshKey={reviewRefreshKey} />
        </div>
      </main>
    </div>
  );
}