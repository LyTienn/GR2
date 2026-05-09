import LoginForm from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { t } = useTranslation();

    return (
        // Thêm animate-in để form xuất hiện mượt mà khi chuyển trang
        <div className="w-full max-w-md space-y-5 animate-in fade-in duration-500">
            <LoginForm />
            <div className='text-center text-sm text-slate-600'>
                {t("layout.login.haventAccount", "Chưa có tài khoản?")}{" "}
                <Link to='/register' className="font-semibold text-black hover:text-blue-500 hover:underline transition-all">
                    {t("layout.login.register", "Đăng ký ngay")}
                </Link>
            </div>
        </div>
    );
};

export default Login;