import RegisterForm from "../components/auth/RegisterForm";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Register = () => {
    const { t } = useTranslation();
    return (
        <div className="w-full max-w-md space-y-5 animate-in fade-in duration-500">
            <RegisterForm />
            <div className="text-center text-sm text-slate-600">
                {t("layout.register.haveAccount")}{" "}
                <Link to="/login" className="font-semibold text-black hover:text-blue-500 hover:underline transition-all">
                    {t("layout.register.login")}
                </Link>
            </div>
        </div>
    )
}

export default Register;