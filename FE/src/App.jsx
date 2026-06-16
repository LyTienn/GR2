import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthLayout from './components/auth/AuthLayout';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProgressProvider } from './contexts/ProgressContext';
import VerifyEmail from './components/auth/VerifyEmail';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfileStart, selectIsAuthenticated } from './store/Auth';
import { useTranslation } from 'react-i18next';
// Admin imports
import AdminLayout from './components/admin/AdminLayout';
import RequireAdmin from './components/admin/RequireAdmin';
import Dashboard from './pages/admin/Dashboard';
import Books from './pages/admin/Books';
import Authors from './pages/admin/Authors';
import Subjects from './pages/admin/Subjects';
import Bookshelves from './pages/admin/Bookshelves';
import Users from './pages/admin/Users';
import Registrations from './pages/admin/Registrations';
import CommentsModeration from './pages/admin/CommentsModeration';
import Settings from './pages/admin/Settings';

const HomePage = lazy(() => import('./pages/HomePage'));
const Read = lazy(() => import('./pages/read/Read'));
const BookSection = lazy(() => import('./pages/BookSection'));
const BookShelf = lazy(() => import('./pages/BookShelf'));
const Profile = lazy(() => import('./pages/Profile'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Membership = lazy(() => import('./pages/Membership'));
const Transactions = lazy(() => import('./pages/transaction/Transactions'))
const GOOGLE_LOGIN_PENDING_KEY = "googleLoginPending";
const GOOGLE_LOGIN_TOAST_MAX_AGE = 5 * 60 * 1000;

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Routes>
          <Route path="/homepage/*" element={<HomePage />} />
          <Route path="*" element={<HomePage />} />
          <Route path="/book/:id/read" element={<Read />} />
          <Route path="/book/:id" element={<BookSection />} />
          <Route path="/bookshelf" element={<BookShelf />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </Suspense>
    </div>
  )
}

function AppContent() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} /> 
        <Route path="/reset-password" element={<ResetPasswordForm />} />
      </Route>
      {/* Admin routes */}
      <Route path='/admin' element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Dashboard />} />
        <Route path='books' element={<Books />} />
        <Route path='authors' element={<Authors />} />
        <Route path='subjects' element={<Subjects />} />
        <Route path='bookshelves' element={<Bookshelves />} />
        <Route path='users' element={<Users />} />
        <Route path='registrations' element={<Registrations />} />
        <Route path='comments' element={<CommentsModeration />} />
        <Route path='settings' element={<Settings />} />
      </Route>
      <Route path='/*' element={<MainLayout />} />
    </Routes>
  )
}

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchProfileStart());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const pendingAt = Number(sessionStorage.getItem(GOOGLE_LOGIN_PENDING_KEY));
    if (!pendingAt) return;

    sessionStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
    if (Date.now() - pendingAt <= GOOGLE_LOGIN_TOAST_MAX_AGE) {
      toast.success(t("toasts.success.loginSuccess"));
    }
  }, [isAuthenticated, t]);

  return (
    <ProgressProvider>
      <AppContent />
      {/* <GlobalProgressTracker /> */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </ProgressProvider>
  )
}
export default App;