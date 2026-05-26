import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Library, BookOpen, Heart, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/HeaderBar";
import BookCard from "@/components/BookCard";
import { AccountSidebar } from "@/components/Account-sidebar";
import { firstValueFrom } from "rxjs";
import HttpClient from "@/service/HttpClient";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 10; 

const BookShelf = () => {
    const { t } = useTranslation();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();    
    const [favorite, setFavorite] = useState([]);
    const [reading, setReading] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("reading");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchBookshelf = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const [resFav, resRead] = await Promise.all([
                firstValueFrom(HttpClient.get('/bookshelf?status=FAVORITE')),
                firstValueFrom(HttpClient.get('/bookshelf?status=READING'))
            ]);
            
            if (resFav?.data) setFavorite(resFav.data.favorites || []);
            if (resRead?.data) setReading(resRead.data.reading || []);
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

    const handleTabChange = (value) => {
        setActiveTab(value);
        setCurrentPage(1);
    };

    const currentBooksData = useMemo(() => {
        const fullList = activeTab === "reading" ? reading : favorite;
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const slicedList = fullList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        const totalPages = Math.ceil(fullList.length / ITEMS_PER_PAGE);
        return { slicedList, totalPages };
    }, [activeTab, reading, favorite, currentPage]);

    if (!isAuthenticated) return null;

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            <Header />
            <main className="flex-1 flex overflow-hidden">
                <div className="shrink-0 border-r bg-card">
                    <AccountSidebar />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-transparent">
                    <div className="shrink-0 px-8 pt-8 pb-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Library className="h-6 w-6 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight">{t("layout.bookshelf.title")}</h1>
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-fit mb-2">
                                <TabsTrigger value="reading" className="px-6 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    {t("layout.bookshelf.tabs.reading")} ({reading.length})
                                </TabsTrigger>
                                <TabsTrigger value="favorite" className="px-6 flex items-center gap-2">
                                    <Heart className="h-4 w-4" />
                                    {t("layout.bookshelf.tabs.favorite")} ({favorite.length})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* 2. Vùng cuộn danh sách sách (Chỉ cuộn ở đây) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-8">
                        <div className="max-w-7xl mx-auto py-4">
                            {loading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-pulse">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="aspect-3/4 bg-muted rounded-xl" />
                                    ))}
                                </div>
                            ) : currentBooksData.slicedList.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                                    {currentBooksData.slicedList.map((book) => (
                                        <BookCard key={book.id || book.book_id} book={book} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-card/50 border border-dashed rounded-2xl">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <Library className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">
                                        {activeTab === "reading" ? t("layout.bookshelf.emptyStates.reading") : t("layout.bookshelf.emptyStates.favorite")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {currentBooksData.totalPages > 1 && (
                        <div className="shrink-0 bg-background/80 backdrop-blur-md px-8 py-4">
                            <div className="max-w-7xl mx-auto flex justify-center">
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={currentBooksData.totalPages}
                                    onPageChange={(page) => setCurrentPage(page)}
                                    className="w-full max-w-2xl"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default BookShelf;