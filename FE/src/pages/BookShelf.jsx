import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Library, BookOpen, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/HeaderBar";
import BookCard from "@/components/BookCard";
import { AccountSidebar } from "@/components/Account-sidebar";
import { firstValueFrom } from "rxjs";
import HttpClient from "@/service/HttpClient";

const BookShelf = () => {
    const { t } = useTranslation();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [favorite, setFavorite] = useState([]);
    const [reading, setReading] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookshelf = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
        const [resFav, resRead] = await Promise.all([
            firstValueFrom(HttpClient.get('/bookshelf?status=FAVORITE')),
            firstValueFrom(HttpClient.get('/bookshelf?status=READING'))
        ]);
        
        console.log("Response Favorite:", resFav);
        console.log("Response Reading:", resRead);
        
        if (resFav?.data) {
            setFavorite(resFav.data.favorites || []);
        }

        if (resRead?.data) {
            setReading(resRead.data.reading || []);
        }

    } catch (error) {
        console.error("Lỗi tải tủ sách:", error);
    } finally {
        setLoading(false);
    }
}, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        fetchBookshelf();
    }, [isAuthenticated, navigate, fetchBookshelf]);

    useEffect(() => {
        const handleUpdate = () => fetchBookshelf();
        window.addEventListener("bookshelf-updated", handleUpdate);
        return () => window.removeEventListener("bookshelf-updated", handleUpdate);
    }, [fetchBookshelf]);

    if (!isAuthenticated) return null;
    const totalBooks = favorite.length + reading.length;
    const BookGrid = ({ books, emptyMessage }) => {
        if (loading) return <div className="text-center py-12">{t("layout.bookshelf.loading")}</div>;
        
        if (!books || books.length === 0) {
            return (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <Library className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {books.map((book) => (
                    <BookCard key={book.id || book.book_id} book={book} />
                ))}
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            <Header />
            <main className="flex-1 flex overflow-hidden">
                <div className="shrink-0">
                    <AccountSidebar />
                </div>
                <div className="flex-1 overflow-y-scroll bg-background/50">
                    <div className="container mx-auto px-8 py-8 max-w-6xl">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <Library className="h-8 w-8 text-primary" />
                                <h1 className="text-3xl font-bold">{t("layout.bookshelf.title")}</h1>
                            </div>
                            {favorite.length === 0 && reading.length === 0 && (
                                <p className="text-muted-foreground text-lg">
                                    {t("layout.bookshelf.emptyMessage")}
                                </p>
                            )}
                        </div>
                        <Tabs defaultValue="reading" className="w-full">
                            <TabsList className="grid w-full max-w-xs grid-cols-2 mb-8 gap-2">
                                <TabsTrigger value="reading" className="flex items-center gap-2 hover:bg-gray-100">
                                    <BookOpen className="h-4 w-4" />
                                    {t("layout.bookshelf.tabs.reading")} ({reading.length})
                                </TabsTrigger>
                                <TabsTrigger value="favorite" className="flex items-center gap-2 hover:bg-gray-100">
                                    <Heart className="h-4 w-4" />
                                    {t("layout.bookshelf.tabs.favorite")} ({favorite.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="reading" className="pb-20 focus-visible:ring-0 focus-visible:outline-none">
                                <BookGrid books={reading} emptyMessage={t("layout.bookshelf.emptyStates.reading")} />
                            </TabsContent>

                            <TabsContent value="favorite" className="pb-20 focus-visible:ring-0 focus-visible:outline-none">
                                <BookGrid books={favorite} emptyMessage={t("layout.bookshelf.emptyStates.favorite")} />
                            </TabsContent>
                        </Tabs>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default BookShelf;