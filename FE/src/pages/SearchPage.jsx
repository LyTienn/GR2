import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import HttpClient from "@/service/HttpClient";
import { firstValueFrom } from 'rxjs';
import BookCard from "@/components/BookCard";
import Header from "@/components/HeaderBar";
import Pagination from "@/components/Pagination";
import SearchComponent from "@/components/Search";
import {
    Loader2,
    Search,
    Filter,
    X,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    SortAsc,
    BookOpen,
    Users,
    Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';

const SearchPage = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Core search params
    const query = searchParams.get('q') || '';

    // Data states
    const [books, setBooks] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalResults, setTotalResults] = useState(0);

    // Filter states
    const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subjectId') || '');
    const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('authorId') || '');
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(1);

    // UI states
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(query);

    // Fetch initial data (Subjects & Authors)
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [subjectsRes, authorsRes] = await Promise.all([
                    firstValueFrom(HttpClient.get("/subjects", { search: { limit: 100 } })), // Increase limit to get all for filter
                    firstValueFrom(HttpClient.get('/authors', { search: { limit: 100 } }))
                ]);

                // Handle Subjects
                if (subjectsRes.success) {
                    const subjectData = subjectsRes.data?.subjects || subjectsRes.data || [];
                    setSubjects(Array.isArray(subjectData) ? subjectData : [])
                }

                // Handle Authors
                if (authorsRes.success) {
                    const authorData = authorsRes.data?.authors || authorsRes.data || [];
                    setAuthors(Array.isArray(authorData) ? authorData : []);
                }
            } catch (error) {
                console.error("Failed to fetch filters:", error);
            }
        };
        fetchFilters();
    }, []);

    // Sync input with url
    useEffect(() => {
        setSearchInput(query);
    }, [query]);

    // Fetch Books
    const fetchBooks = useCallback(async () => {
        try {
            setLoading(true);
            const page = parseInt(searchParams.get('page')) || 1;
            setCurrentPage(page);

            const params = {
                q: query,
                limit: 20,
                page: page,
                sort: sortBy
            };

            if (selectedSubject) params.subjectId = selectedSubject;
            if (selectedAuthor) params.authorId = selectedAuthor;
            if (selectedType) params.type = selectedType;

            const res = await firstValueFrom(HttpClient.get('/books', { search: params }));
            const resultData = res.data?.books || [];

            setBooks(Array.isArray(resultData) ? resultData : []);

            const total = res.data?.total || 0;
            setTotalResults(total);
            setTotalPages(Math.ceil(total / 20)); // Assuming limit 20

        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setLoading(false);
        }
    }, [query, selectedSubject, selectedAuthor, selectedType, sortBy, searchParams]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    // Memoized sorted filters
    const sortedSubjects = useMemo(() => {
        return [...subjects].sort((a, b) => {
            if (String(a.id) === selectedSubject) return -1;
            if (String(b.id) === selectedSubject) return 1;
            return 0; // Keep original order (API sorted by books_count)
        });
    }, [subjects, selectedSubject]);

    const sortedAuthors = useMemo(() => {
        return [...authors].sort((a, b) => {
            if (String(a.id) === selectedAuthor) return -1;
            if (String(b.id) === selectedAuthor) return 1;
            return 0; // Keep original order (API sorted by books_count)
        });
    }, [authors, selectedAuthor]);

    // Handlers
    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (searchInput) {
            params.set('q', searchInput);
        } else {
            params.delete('q');
        }
        params.delete('page'); // Reset to page 1 on new search
        setSearchParams(params);
    };

    const updateFilter = (key, value) => {
        if (key === 'subjectId') setSelectedSubject(value === selectedSubject ? '' : value);
        if (key === 'authorId') setSelectedAuthor(value === selectedAuthor ? '' : value);
        if (key === 'type') setSelectedType(value === selectedType ? '' : value);
        if (key === 'sort') setSortBy(value);

        const params = new URLSearchParams(searchParams);
        if (value && value !== selectedSubject && value !== selectedAuthor && value !== selectedType) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page'); // Reset to page 1 on filter change
        setSearchParams(params);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;

        const params = new URLSearchParams(searchParams);
        params.set('page', newPage);
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSelectedSubject('');
        setSelectedAuthor('');
        setSelectedType('');
        setSortBy('newest');
        setSearchInput('');
        navigate('/search');
    };

    // Components
    const FilterSection = ({ title, icon: Icon, children, totalItems }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const INITIAL_ITEMS = 5;
        const hasMore = totalItems > INITIAL_ITEMS;

        // Since children is an array of elements (from map), we can slice it if it's an array
        // However, children passed here is usually the result of .map(), which is an array.
        const displayedChildren = isExpanded ? children : (Array.isArray(children) ? children.slice(0, INITIAL_ITEMS) : children);

        return (
            <div className="mb-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                    {Icon && <Icon className="w-4 h-4 text-blue-600" />}
                    {title}
                </h3>
                <div className="space-y-2 pr-2">
                    {displayedChildren}
                </div>
                {hasMore && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2 flex items-center gap-1"
                    >
                        {isExpanded ? (
                            <>{t("layout.searchpage.sidebar.collapseText")} <ChevronDown className="w-3 h-3 rotate-180" /></>
                        ) : (
                            <>{t("layout.searchpage.sidebar.showmoreText")} {totalItems - INITIAL_ITEMS} {t("layout.searchpage.sidebar.sectionText")} <ChevronDown className="w-3 h-3" /></>
                        )}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className='h-screen flex flex-col bg-slate-50 overflow-hidden'>
            <div className="shrink-0 z-40">
                <Header />
            </div>

            <main className='flex-1 overflow-hidden max-w-screen-2xl mx-auto px-8 pt-2 flex flex-col'>
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden shrink-0 mb-4 flex justify-between items-center">
                    <Button variant="outline" onClick={() => setIsMobileFilterOpen(true)} className="flex items-center gap-2">
                        <Filter className="w-4 h-4" /> {t("layout.searchpage.sidebar.filter")}
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-8">
                    <aside className={`
                        fixed inset-0 z-50 bg-white transition-transform duration-300 transform flex flex-col
                        lg:relative lg:translate-x-0 lg:z-0 lg:w-72 lg:block lg:bg-transparent lg:p-0
                        lg:h-full lg:overflow-y-auto hover-scrollbar lg:pb-8 lg:pr-2
                        ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}>
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 lg:hidden shrink-0">
                            <h2 className="text-xl font-bold">{t("layout.searchpage.sidebar.title")}</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileFilterOpen(false)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 lg:p-0 custom-scrollbar">
                            <div className='mb-8 block lg:hidden'>
                                <SearchComponent
                                    variant="static"
                                />
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:sticky lg:top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                        <SlidersHorizontal className="w-5 h-5" />
                                        {t("layout.searchpage.sidebar.filter")}
                                    </h2>
                                    {(selectedSubject || selectedAuthor || selectedType) && (
                                        <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-medium">
                                            {t("layout.searchpage.sidebar.deleteAllBtn")}
                                        </button>
                                    )}
                                </div>

                                {/* Type Filter */}
                                <FilterSection title={t("layout.searchpage.sidebar.filterSection.bookType")} icon={Tag} totalItems={3}>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedType === '' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                                            {selectedType === '' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <input type="radio" name="type" className="hidden" checked={selectedType === ''} onChange={() => updateFilter('type', '')} />
                                        <span className={`text-sm ${selectedType === '' ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{t("layout.searchpage.sidebar.filterSection.bookTypeChoice.all")}</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedType === 'FREE' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                                            {selectedType === 'FREE' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <input type="radio" name="type" className="hidden" checked={selectedType === 'FREE'} onChange={() => updateFilter('type', 'FREE')} />
                                        <span className={`text-sm ${selectedType === 'FREE' ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{t("layout.searchpage.sidebar.filterSection.bookTypeChoice.free")}</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedType === 'PREMIUM' ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                                            {selectedType === 'PREMIUM' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <input type="radio" name="type" className="hidden" checked={selectedType === 'PREMIUM'} onChange={() => updateFilter('type', 'PREMIUM')} />
                                        <span className={`text-sm ${selectedType === 'PREMIUM' ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{t("layout.searchpage.sidebar.filterSection.bookTypeChoice.premium")}</span>
                                    </label>
                                </FilterSection>

                                <div className="h-px bg-slate-100 my-4" />

                                {/* Subjects Filter */}
                                <FilterSection title={t("layout.searchpage.sidebar.filterSection.subject")} icon={BookOpen} totalItems={sortedSubjects.length}>
                                    {Array.isArray(sortedSubjects) && sortedSubjects.map(subject => (
                                        <label key={subject.id} className="flex items-start gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${selectedSubject === String(subject.id) ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                                                {selectedSubject === String(subject.id) && <CheckIcon />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedSubject === String(subject.id)}
                                                onChange={() => updateFilter('subjectId', String(subject.id))}
                                            />
                                            <span className={`text-sm ${selectedSubject === String(subject.id) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{subject.name}</span>
                                        </label>
                                    ))}
                                </FilterSection>

                                <div className="h-px bg-slate-100 my-4" />

                                {/* Authors Filter */}
                                <FilterSection title={t("layout.searchpage.sidebar.filterSection.author")} icon={Users} totalItems={sortedAuthors.length}>
                                    {Array.isArray(sortedAuthors) && sortedAuthors.map(author => (
                                        <label key={author.id} className="flex items-start gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${selectedAuthor === String(author.id) ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                                                {selectedAuthor === String(author.id) && <CheckIcon />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedAuthor === String(author.id)}
                                                onChange={() => updateFilter('authorId', String(author.id))}
                                            />
                                            <span className={`text-sm ${selectedAuthor === String(author.id) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{author.name}</span>
                                        </label>
                                    ))}
                                </FilterSection>
                            </div>
                        </div>
                    </aside>

                    {isMobileFilterOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                            onClick={() => setIsMobileFilterOpen(false)}
                        />
                    )}

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                        
                        {/* ========================================= */}
                        {/* CỤM ĐIỀU KHIỂN CỐ ĐỊNH (Không dùng sticky nữa) */}
                        {/* ========================================= */}
                        <div className="shrink-0 bg-slate-50 pb-2 z-10">
                            {/* Top Bar */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
                                        <SortAsc className="w-4 h-4" />
                                        <span className="hidden sm:inline">Sắp xếp:</span>
                                    </div>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => updateFilter('sort', e.target.value)}
                                        className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                    >
                                        <option value="newest">Mới nhất</option>
                                        <option value="oldest">Cũ nhất</option>
                                        <option value="a-z">Tên (A-Z)</option>
                                        <option value="z-a">Tên (Z-A)</option>
                                        <option value="views">Phổ biến nhất</option>
                                    </select>
                                </div>

                                <Button 
                                    onClick={clearFilters} 
                                    variant="outline"
                                    className="w-full sm:w-auto text-slate-600 hover:text-slate-900 border-slate-300 hover:bg-slate-50"
                                >
                                    <span>↺</span> Đặt lại
                                </Button>
                            </div>

                            {/* Search Query Indicator */}
                            {query && (
                                <div className="mb-4">
                                    <h1 className='text-2xl font-bold text-slate-800'>
                                        Kết quả tìm kiếm cho: <span className='text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600'>"{query}"</span>
                                    </h1>
                                    <p className='text-slate-500 mt-1'>
                                        Tìm thấy {totalResults} kết quả phù hợp.
                                    </p>
                                </div>
                            )}

                            {/* Active Filters Display */}
                            {(selectedSubject || selectedAuthor || selectedType) && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedType && (
                                        <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1">
                                            {selectedType === 'FREE' ? 'Miễn phí' : 'Premium'}
                                            <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('type', '')} />
                                        </Badge>
                                    )}
                                    {selectedSubject && (
                                        <Badge variant="secondary" className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1">
                                            {subjects.find(s => String(s.id) === selectedSubject)?.name || 'Chủ đề'}
                                            <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('subjectId', '')} />
                                        </Badge>
                                    )}
                                    {selectedAuthor && (
                                        <Badge variant="secondary" className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1">
                                            {authors.find(a => String(a.id) === selectedAuthor)?.name || 'Tác giả'}
                                            <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('authorId', '')} />
                                        </Badge>
                                    )}
                                    <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-red-500 underline ml-2">
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            )}

                            {totalPages > 0 && !loading && books.length > 0 && (
                                <div className="flex justify-end p-2.5">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        className="w-full justify-between"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto hover-scrollbar pb-20 pr-2 pt-2">
                            {/* Results Grid */}
                            {loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-xl h-80 animate-pulse border border-slate-100">
                                            <div className="h-48 bg-slate-200 rounded-t-xl" />
                                            <div className="p-4 space-y-3">
                                                <div className="h-4 bg-slate-200 rounded w-3/4" />
                                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                                                <div className="h-8 bg-slate-200 rounded w-full mt-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {books.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                            {books.map((book) => (
                                                <div key={book.id} className="cursor-pointer transition-transform hover:-translate-y-1">
                                                    <BookCard book={book} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                                            <div className="bg-slate-50 p-6 rounded-full mb-4">
                                                <Search className="w-12 h-12 text-slate-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">Không tìm thấy kết quả</h3>
                                            <p className="text-slate-500 max-w-md text-center mt-2 mb-6">
                                                Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm kết quả phù hợp hơn.
                                            </p>
                                            <Button onClick={clearFilters} variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                Xóa bộ lọc & thử lại
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                    </div>
                </div>
            </div>
            </main >
        </div >
    );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export default SearchPage;