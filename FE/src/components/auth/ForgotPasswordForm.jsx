import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { forgotPasswordStart } from "@/store/Auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const ForgotPasswordForm = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [infoMessage, setInfoMessage] = useState("");

    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.warn(t("toasts.warn.missingFields"));
            return;
        }

        dispatch(forgotPasswordStart({
            email: email.trim(),
            onSuccess: () => {
                setIsSubmitted(true);
                setInfoMessage(t("layout.forgotPassword.successMessage"));
                toast.success(t("toasts.success.requestSent"));
            },
            onError: () => {
                toast.error(t("toasts.error.requestFailed"));
            },
        }));
    };

    return (
        <Card className="w-full max-w-md shadow-lg border-slate-200 animate-in fade-in duration-500">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                    {t("layout.forgotPassword.title")}
                </CardTitle>
                <CardDescription className="text-center">
                    {t("layout.forgotPassword.description")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="space-y-2">
                            <Label htmlFor="email">{t("layout.login.email")}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t("layout.login.emailPlaceholder")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                t("layout.forgotPassword.submitButton")
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-center my-2 space-y-3">
                        <div className="flex justify-center text-blue-600">
                            <MailCheck className="h-10 w-10 text-blue-500" />
                        </div>
                        <p className="text-sm font-medium text-blue-900 leading-relaxed">
                            {infoMessage}
                        </p>
                    </div>
                )}

                <div className="mt-4 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-black transition-colors gap-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t("layout.verifyEmail.backToLogin")}
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

export default ForgotPasswordForm;
