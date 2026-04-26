import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Search from './Search';
import { Button } from "@/components/ui/button";
import { BookOpen, User, LogOut, Library, LayoutDashboard, Zap, Settings, Crown, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'react-toastify';
import { logoutStart } from '@/store/Auth';
import PaymentService from '@/service/PaymentService';
import { selectAuthUser, selectIsAuthenticated, selectAuthLoading, selectAuthError } from '@/store/Auth/authSelector';
import i18n from '../i18n.js';
import { useTranslation } from 'react-i18next';

const HeaderBar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  const user = useSelector(selectAuthUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const wasAuthenticated = useRef(isAuthenticated);
  
  const FlagVI = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-4 rounded-sm shadow-xs">
    <rect width="512" height="512" fill="#da251d"/>
    <polygon fill="#ff0" points="256,114 300,248 442,248 327,331 371,465 256,382 141,465 185,331 70,248 212,248"/>
  </svg>
);

const FlagEN = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-5 h-4 rounded-sm shadow-xs">
    <clipPath id="a"><path d="M0 0h60v30H0z"/></clipPath>
    <g clipPath="url(#a)"><path d="M0 0h60v30H0z" fill="#012169"/>
    <path d="m0 0 60 30M60 0 0 30" stroke="#fff" strokeWidth="6"/><path d="m0 0 60 30M60 0 0 30" stroke="#c8102e" strokeWidth="4"/>
    <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6"/></g>
  </svg>
);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await PaymentService.getCurrentSubscription();
        setSubscription(data.subscription);
        setIsExpired(data.isExpired);
      } catch (e) {
        setSubscription(null);
        setIsExpired(true);
      }
    };
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      toast.success('Đăng xuất thành công!', {
        toastId: 'logout-success-toast' 
      });
      navigate('/homepage');
    }
    if (error) {
      toast.error(error, {
        toastId: 'auth-error-toast'
      });
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, error, navigate]);

  const handleLogout = () => {
    dispatch(logoutStart());
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getSubscriptionText = () => {
    if (!user) return "";
    if (user.role === "ADMIN") return "Quản trị viên";
    if (user.subscription && !user.isExpired) {
      const pkg = user.subscription.package_details;
      if (pkg === "3_THANG") return t("layout.header.modal_header.package.3m");
      if (pkg === "6_THANG") return t("layout.header.modal_header.package.6m");
      if (pkg === "12_THANG") return t("layout.header.modal_header.package.12m");
      return t("layout.header.modal_header.package.current");
    }
    return t("layout.header.modal_header.package.current");
  };

  return (
    <header
      className={`border-b sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md border-slate-200" : "bg-white/50 backdrop-blur-sm border-transparent"
        }`}
    >
      <div className='max-w-screen-2xl mx-auto h-16 px-6 flex items-center justify-between'>
        {/* LOGO */}
        <Link to="/" className='flex items-center gap-2 group'>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white transition-transform group-hover:scale-105 shadow-md shadow-blue-200">
            <BookOpen className='h-5 w-5' />
          </div>
          <span className='hidden font-serif text-xl font-bold text-slate-800 sm:block'>{t("layout.header.title")}</span>
        </Link>

        {/* SEARCH BAR - DESKTOP */}
        <div className="hidden flex-1 max-w-md mx-8 md:block">
          <Search variant="static" />
        </div>

        {/* NAV/TRANS - DESKTOP */}
        <nav className="hidden md:flex items-center gap-2">
            <div className="flex items-center bg-slate-200/60 p-1 rounded-lg border border-slate-300/50 mr-4">
            {/* Nút Tiếng Việt */}
            <button
              onClick={() => i18n.changeLanguage('vi')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
                i18n.language === 'vi' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/30' 
              }`}
            >
              <FlagVI />
              <span className="text-xs font-bold tracking-tight">VI</span>
            </button>

            {/* Nút Tiếng Anh */}
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
                i18n.language?.startsWith('en') 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/30'
              }`}
            >
              <FlagEN />
              <span className="text-xs font-bold tracking-tight">EN</span>
            </button>
          </div>
          <Button variant="ghost" onClick={() => navigate('/search')} className={`transition-colors ${
              location.pathname === '/search' 
                ? "bg-slate-100 text-slate-600 font-semibold" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100" 
            }`}>
            {t("layout.header.explore")}
          </Button>

          {/* Show Premium Button if not premium or guest */}
          {(!isAuthenticated || (user && user.tier !== "PREMIUM" && user.role !== "ADMIN")) && (
            <Button
              variant="ghost"
              onClick={() => navigate('/membership')}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Premium
            </Button>
          )}

          {isAuthenticated ? (
            <>
              {user?.role !== "admin" && user?.tier === "PREMIUM" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/membership')}
                  className="hidden sm:flex border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100"
                >
                  <Crown className='h-4 w-4 mr-2 text-amber-600' />
                  {getSubscriptionText()}
                </Button>
              )}

              {user?.role === "admin" && (
                <Link to="/admin/users">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Quản trị
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 pl-2 pr-2 hover:bg-slate-100 flex items-center gap-2 border border-transparent hover:border-slate-200">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span
                      className="font-medium max-w-[100px] truncate text-slate-700 hidden lg:block"
                      title={user?.fullName || user?.full_name}
                    >
                      {user?.fullName || user?.full_name || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>{t("layout.header.modal_header.my_account")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">
                      <span className="font-medium text-slate-700">{getSubscriptionText()}</span>
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />

                  {user?.role !== "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/bookshelf")} className="cursor-pointer hover:bg-slate-100">
                      <Library className="h-4 w-4 mr-2" />
                      {t("layout.header.modal_header.bookshelf")}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer hover:bg-slate-100">
                    <Settings className="h-4 w-4 mr-2" />
                    {t("layout.header.modal_header.setting")}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("layout.header.modal_header.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')} className="hover:bg-slate-100">
                {t("layout.header.login")}
              </Button>
              <Button onClick={() => navigate('/register')} className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 hover:shadow-xl transition-all">
                {t("layout.header.register")}
              </Button>
            </>
          )}
        </nav>

        {/* MOBILE MENU BUTTON */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Search Icon (opens expanded mode or just navigates) - simplified to standard search component in dynamic mode if needed, but here we put it in menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-600"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMenuOpen && (
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur-xl md:hidden absolute top-16 left-0 right-0 shadow-xl animate-in slide-in-from-top-2 p-4 flex flex-col gap-4">
          {/* <div className="relative">
            <Search variant="static" className="w-full" />
          </div> */}

          <nav className="flex flex-col gap-2">
            <div className="flex items-center w-fit bg-slate-200/60 p-1 rounded-lg border border-slate-300/50 mb-2">
            {/* Nút Tiếng Việt */}
            <button
              onClick={() => i18n.changeLanguage('vi')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
                i18n.language === 'vi' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/30' 
              }`}
            >
              <FlagVI />
              <span className="text-xs font-bold tracking-tight">VI</span>
            </button>

            {/* Nút Tiếng Anh */}
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
                i18n.language?.startsWith('en') 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/30'
              }`}
            >
              <FlagEN />
              <span className="text-xs font-bold tracking-tight">EN</span>
            </button>
          </div>
            <Button variant="ghost" onClick={() => { navigate('/search'); setIsMenuOpen(false); }} className={`transition-colors ${
              location.pathname === '/search' 
                ? "bg-slate-100 text-slate-600 font-semibold justify-start" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 justify-start" 
            }`}>
              <BookOpen className="mr-2 h-4 w-4" /> {t("layout.header.explore")}
            </Button>
            {(!isAuthenticated || (user && user.tier !== "PREMIUM" && user.role !== "ADMIN")) && (
            <Button
              variant="ghost"
              onClick={() => { navigate('/membership'); setIsMenuOpen(false); }}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 justify-start"
            >
              <Zap className="h-4 w-4 mr-2" />
              Premium
            </Button>
          )}

            {isAuthenticated ? (
              <>
                <Button variant="ghost" className="justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>
                  <User className="mr-2 h-4 w-4" /> {user?.fullName || "User"}
                </Button>
                <Button variant="ghost" className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> {t("layout.header.modal_header.logout")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="justify-start" onClick={() => { navigate('/login'); setIsMenuOpen(false); }}>
                  <User className="mr-2 h-4 w-4" /> {t("layout.header.login")}
                </Button>
                <Button className="justify-start bg-slate-900 text-white" onClick={() => { navigate('/register'); setIsMenuOpen(false); }}>
                  {t("layout.header.register")}
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default HeaderBar;