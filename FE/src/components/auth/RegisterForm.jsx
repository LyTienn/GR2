import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { registerStart } from "@/store/Auth";
import { useTranslation } from "react-i18next";

const getRegisterErrorKey = (error) => {
    const message = error?.message?.toLowerCase() || "";
    if (error?.status === 409 || message.includes("email")) {
        return "toasts.error.emailAlreadyRegistered";
    }
    return "toasts.error.registerFailed";
};

const getRegisterValidationErrorKey = ({ name, email, password, confirmPassword }) => {
    if (!name.trim()) return "toasts.error.FULL_NAME_REQUIRED";
    if (name.trim().length < 2 || name.trim().length > 255) return "toasts.error.FULL_NAME_LENGTH_INVALID";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "toasts.error.INVALID_EMAIL";
    if (!password || password.trim().length === 0) return "toasts.error.PASSWORD_REQUIRED"; 
    if (password.length < 6) return "toasts.error.PASSWORD_TOO_SHORT";
    if (password !== confirmPassword) return "toasts.error.confirmPassword";
    
    return null;
};

const RegisterForm = () => {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationErrorKey = getRegisterValidationErrorKey({ name, email, password, confirmPassword });
        if (validationErrorKey) {
            toast.error(t(validationErrorKey));
            return;
        }

        dispatch(registerStart({
            userData: { email: email.trim(), password, fullName: name.trim() },
            onSuccess: () => {
                toast.success(t("toasts.success.registerSuccess"));
                navigate("/login");
            },
            onError: (error) => {
                const errorCode = error?.errorCode || error?.data?.errorCode || error?.data?.data?.errorCode;
                if (errorCode) {
                    const i18nKey = `toasts.error.${errorCode}`;
                    toast.error(t(i18nKey, error?.message || "Registration failed"));
                } else {
                    toast.error(t(getRegisterErrorKey(error)));
                }
            }
        }));
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>{t("layout.register.title")}</CardTitle>
                <CardDescription>{t("layout.register.description")}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("layout.register.labelName")}</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder={t("layout.register.placeholderName")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{t("layout.register.password")}</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t("layout.register.confirmPassword")}</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full hover:shadow-gray-400"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("layout.login.processing")}
                            </>
                        ) : (
                            t("layout.register.submitButton")
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default RegisterForm;
