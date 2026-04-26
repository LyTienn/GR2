import { Search as SearchIcon, Loader2, X } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import HttpClient from "@/service/HttpClient";
import { Subject, debounceTime, switchMap, catchError, of, tap } from 'rxjs';
import { useTranslation } from "react-i18next";

const Search = ({ variant = "dynamic", className = "" }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(variant === "static");
    const [keyword, setKeyword] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const searchSubject = useRef(new Subject()).current;
    // In static mode, always open interaction-wise, but we manage dropdown visibility differently
    const [showDropdown, setShowDropdown] = useState(false);

    // Sync variant changes or init
    useEffect(() => {
        if (variant === "static") {
            setIsOpen(true);
        }
    }, [variant]);

    useEffect(() => {
        const subscription = searchSubject.pipe(
            debounceTime(400), 
            switchMap((term) => {
                if (!term.trim()) {
                    setLoading(false);
                    return of(null); 
                }
                
                setLoading(true);
                return HttpClient.get(`/books?keyword=${encodeURIComponent(term)}`).pipe(
                    catchError((error) => {
                        console.error("Live search error:", error);
                        return of(null);
                    })
                );
            })
        ).subscribe((res) => {
            setLoading(false);
            if (res && res.data && res.data.books) {
                const resultData = res.data.books;
                setSuggestions(Array.isArray(resultData) ? resultData.slice(0, 5) : []);
            } else {
                setSuggestions([]);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleChange = (e) => {
        const term = e.target.value;
        setKeyword(term);
        
        if (term.trim()) {
            if (variant === "dynamic") setIsOpen(true);
            setShowDropdown(true);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
            if (variant === "dynamic") setIsOpen(false);
        }
        searchSubject.next(term);
    };

    const goToSearchPage = () => {
        if (keyword.trim()) {
            navigate(`/search?q=${encodeURIComponent(keyword)}`);
            setShowDropdown(false);
            if (variant === "dynamic") setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            goToSearchPage();
        }
    };

    const handleIconClick = () => {
        if (variant === "static") {
            inputRef.current?.focus();
            return;
        }

        if (isOpen && keyword) {
            goToSearchPage();
        } else {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
                if (variant === "dynamic" && !keyword) {
                    setIsOpen(false);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef, variant, keyword]);

    const containerClasses = variant === "static"
        ? `relative flex items-center w-full ${className}`
        : `relative flex items-center transition-all duration-300 ${isOpen ? "w-72" : "w-10"} ${className}`;

    const inputClasses = variant === "static"
        ? `w-full pl-10 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-100 transition-colors`
        : `w-full pl-10 pr-8 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible w-0 p-0 border-none"}`;

    return (
        <div ref={wrapperRef} className={`relative z-50 ${variant === "static" ? "w-full" : ""}`}>
            {/* INPUT FORM */}
            <div className={containerClasses}>
                <button
                    type="button"
                    onClick={handleIconClick}
                    className={`absolute left-0 p-2 rounded-full z-10 ${variant === "static" ? "cursor-default" : "hover:bg-gray-100"}`}
                >
                    <SearchIcon className={`h-4 w-4 ${variant === "static" ? "text-muted-foreground" : "text-slate-600"}`} />
                </button>

                <input
                    ref={inputRef}
                    id="main-search"
                    name="main-search"
                    type="text"
                    value={keyword}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => keyword && setShowDropdown(true)}
                    placeholder={t("layout.header.search_placeholder")}
                    aria-label={t("layout.header.search_ariaLabel")}
                    className={inputClasses}
                />

                {/* Nút Xóa text */}
                {isOpen && keyword && (
                    <button
                        onClick={() => { setKeyword(""); setSuggestions([]); setShowDropdown(false); inputRef.current?.focus(); }}
                        className="absolute right-2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* DROPDOWN LIVE SEARCH */}
            {open && keyword && (
                <div className="absolute top-full mt-2 w-80 right-0 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-4 text-center text-slate-400 flex justify-center items-center gap-2">
                            <Loader2 className="animate-spin h-4 w-4" /> {t("layout.header.search_dropDown.loading")}
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul>
                            {/* Danh sách gợi ý */}
                            {suggestions.map((book) => (
                                <li key={book.id} className="border-b border-slate-50 last:border-none">
                                    <Link
                                        to={`/book/${book.id}`}
                                        className="px-4 py-3 hover:bg-slate-50 transition flex items-start gap-3"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="w-10 h-14 bg-slate-200 rounded shrink-0 overflow-hidden">
                                            <img src={book.image_url} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 line-clamp-1">{book.title}</p>
                                            <p className="text-xs text-slate-500 line-clamp-1">{book.author?.name || "Tác giả ẩn danh"}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}

                            <li className="bg-slate-50 p-2 text-center">
                                <button
                                    onClick={goToSearchPage}
                                    className="text-sm text-blue-600 font-medium hover:underline w-full py-1"
                                >
                                    {t("layout.header.search_dropDown.getResult")} "{keyword}"
                                </button>
                            </li>
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-slate-500 text-sm">
                            {t("layout.header.search_dropDown.noResult")}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;