import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginStart } from "@/store/Auth";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

const LoginForm = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoading, user, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            toast.success(t("toasts.success.loginSuccess"));
            if ((user.role || "").toUpperCase() === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        }
    }, [isAuthenticated, user, navigate, t]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.warn(t("toasts.warn.missingFields"));
            return;
        }
        dispatch(loginStart({ email, password }));
    };

    return (
        <Card className="w-full max-w-md shadow-lg border-slate-200">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                    {t("layout.login.title")}
                </CardTitle>
                <CardDescription className="text-center">
                    {t("layout.login.description")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">{t("layout.login.email")}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t("layout.login.emailPlaceholder")}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Mật khẩu */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">{t("layout.login.password")}</Label>
                            <Link 
                                to="/forgot-password" 
                                className="text-sm font-medium text-black hover:text-blue-500 transition-colors"
                            >
                                {t("layout.login.forgotPassword")}
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pr-10" 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full mt-2 transition-all hover:shadow-md"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("layout.login.processing")}
                            </>
                        ) : (
                            t("layout.login.submitButton")
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default LoginForm;