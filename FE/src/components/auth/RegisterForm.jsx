import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerStart, clearAuthError } from "@/store/Auth";
import { useTranslation } from "react-i18next";

const RegisterForm = () => {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isRegisterSuccess, error } = useSelector((state) => state.auth);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error(t("toasts.error.confirmPassword"));
            return;
        }

        dispatch(registerStart({
            userData: { email, password, fullName: name },
            onSuccess: () => {
                toast.success(t("toasts.success.registerSuccess"));
                navigate("/login");
            },
            onError: (errorMessage) => {
                toast.error(errorMessage);
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("layout.register.labelName")}</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder={t("layout.register.placeholderName")}
                            required
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
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{t("layout.register.password")}</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t("layout.register.confirmPassword")}</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    <Button type="submit" className="w-full hover:shadow-gray-400">{t("layout.register.submitButton")}</Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default RegisterForm;