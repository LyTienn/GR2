import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 *
 * BE redirect về đây sau khi user click link trong email:
 *   - Thành công : /verify-email?status=success
 *   - Thất bại   : /verify-email?status=failed&errorCode=<code>
 */

const errorCodeToI18nKey = {
  "INVALID_OR_USED_TOKEN": "layout.verifyEmail.invalidOrUsedToken",
  "ALREADY_ACTIVATED": "layout.verifyEmail.alreadyActivated",
  "EXPIRED_TOKEN": "layout.verifyEmail.verificationLinkExpired",
  "MISSING_TOKEN": "layout.verifyEmail.processingDesc",
};

const VerifyEmail = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState(null);
    const [errorCode, setErrorCode] = useState(null);

    useEffect(() => {
        const statusParam = searchParams.get("status");
        const codeParam = searchParams.get("errorCode");

        setStatus(statusParam);
        if (codeParam) {
            setErrorCode(codeParam);
        }
    }, [searchParams]);

    // Chưa có params — user vào thẳng URL này
    if (!status) {
        return (
            <div className="w-full max-w-md animate-in fade-in duration-500">
                <Card className="shadow-lg border-slate-200 text-center">
                    <CardHeader className="space-y-2 pb-4">
                        <div className="flex justify-center">
                            <Loader2 className="h-16 w-16 text-slate-400 animate-spin" />
                        </div>
                        <CardTitle className="text-xl">
                            {t("layout.verifyEmail.processingTitle")}
                        </CardTitle>
                        <CardDescription>
                            {t("layout.verifyEmail.processingDesc")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full hover:bg-slate-200">
                            <Link to="/login">
                                {t("layout.verifyEmail.backToLogin")}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isSuccess = status === "success";
    const errorMessage = errorCode 
        ? t(errorCodeToI18nKey[errorCode] || "layout.verifyEmail.failedDesc")
        : t("layout.verifyEmail.failedDesc");

    return (
        <div className="w-full max-w-md animate-in fade-in duration-500">
            <Card className="shadow-lg border-slate-200 text-center">
                <CardHeader className="space-y-3 pb-4">
                    <div className="flex justify-center">
                        {isSuccess ? (
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        ) : (
                            <XCircle className="h-16 w-16 text-red-500" />
                        )}
                    </div>

                    <CardTitle className="text-xl">
                        {isSuccess
                            ? t("layout.verifyEmail.successTitle")
                            : t("layout.verifyEmail.failedTitle")}
                    </CardTitle>

                    <CardDescription>
                        {isSuccess
                            ? t("layout.verifyEmail.successDesc")
                            : errorMessage}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                    {isSuccess ? (
                        <Button asChild className="w-full hover:bg-slate-200">
                            <Link to="/login">
                                {t("layout.verifyEmail.loginButton")}
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild className="w-full hover:bg-slate-200">
                                <Link to="/register">
                                    {t("layout.verifyEmail.registerAgain")}
                                </Link>
                            </Button>
                            <Button asChild className="w-full hover:bg-slate-200">
                                <Link to="/login">
                                    {t("layout.verifyEmail.backToLogin")}
                                </Link>
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyEmail;