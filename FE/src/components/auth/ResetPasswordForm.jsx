import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPasswordStart } from "@/store/Auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const getResetPasswordErrorKey = (error) => {
    const errorCode = error?.errorCode || error?.data?.errorCode;
    if (errorCode) return `toasts.error.${errorCode}`;
    return "toasts.error.resetPasswordFailed";
};

const ResetPasswordForm = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading } = useSelector((state) => state.auth);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!token) {
            toast.error(t("layout.resetPassword.missingToken"));
            return;
        }

        if (newPassword.length < 6) {
            toast.warn(t("layout.resetPassword.passwordLength"));
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.warn(t("layout.resetPassword.passwordMismatch"));
            return;
        }

        dispatch(resetPasswordStart({
            token,
            newPassword,
            onSuccess: () => {
                setIsSuccess(true);
                toast.success(t("toasts.success.resetPasswordSuccess"));
                setTimeout(() => navigate("/login"), 4000);
            },
            onError: (error) => {
                toast.error(t(getResetPasswordErrorKey(error)));
            },
        }));
    };

    if (!token) {
        return (
            <Card className="w-full max-w-md shadow-lg border-slate-200 text-center">
                <CardHeader>
                    <CardTitle className="text-red-600 text-xl">
                        {t("layout.resetPassword.invalidTokenTitle")}
                    </CardTitle>
                    <CardDescription>
                        {t("layout.resetPassword.invalidTokenDescription")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link to="/login">{t("layout.verifyEmail.backToLogin")}</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md shadow-lg border-slate-200 animate-in fade-in duration-500">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                    {t("layout.resetPassword.title")}
                </CardTitle>
                <CardDescription className="text-center">
                    {t("layout.resetPassword.description")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">{t("layout.resetPassword.newPassword")}</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="pr-10"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t("layout.resetPassword.confirmPassword")}</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                            />
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
                                t("layout.resetPassword.submitButton")
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center my-2 space-y-3">
                        <div className="flex justify-center text-green-600">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                        <p className="text-sm font-semibold text-green-900">
                            {t("layout.resetPassword.successTitle")}
                        </p>
                        <p className="text-xs text-slate-500">
                            {t("layout.resetPassword.redirecting")}
                        </p>
                        <Button asChild variant="outline" className="w-full mt-2">
                            <Link to="/login">{t("layout.resetPassword.loginNow")}</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ResetPasswordForm;
