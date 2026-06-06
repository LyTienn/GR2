import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { User, Lock, Trash2, Save, Loader2, AlertTriangle } from "lucide-react";
import Header from "@/components/HeaderBar";
import { AccountSidebar } from "@/components/Account-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import AuthService from "@/service/AuthService";
import { fetchProfileStart, logoutStart } from "@/store/Auth/authSlice";
import HttpClient from "@/service/HttpClient";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({ fullName: "", email: "" });
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loadingPass, setLoadingPass] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [accountType, setAccountType] = useState({ hasPassword: true, hasGoogle: false });
  const [loadingAccountType, setLoadingAccountType] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user) {
      setProfileData({
        fullName: user.fullName || user.full_name || "",
        email: user.email || "",
      });
    }
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const sub = HttpClient.get("/users/account-type").subscribe({
      next: (res) => {
        if (res?.success) setAccountType(res.data);
        setLoadingAccountType(false);
      },
      error: () => setLoadingAccountType(false),
    });

    return () => sub.unsubscribe();
  }, [isAuthenticated]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      await AuthService.updateProfile({
        fullName: profileData.fullName,
        email: profileData.email
      });
      dispatch(fetchProfileStart());
      toast.success(t("toasts.success.updateProfileSuccess"));
    } catch (error) {
      toast.error(error.response?.message || error.response?.data?.message || t("toasts.error.updateProfileError"));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passData.newPassword !== passData.confirmPassword) {
      toast.error(t("toasts.error.confirmPassword"));
      return;
    }
    if (passData.newPassword.length < 6) {
      toast.error(t("toasts.error.passwordTooShort"));
      return;
    }

    setLoadingPass(true);
    try {
      await AuthService.changePassword({
        // Tài khoản Google thuần → không gửi currentPassword
        ...(accountType.hasPassword && { currentPassword: passData.currentPassword }),
        newPassword: passData.newPassword,
      });

      const successMsg = accountType.hasPassword
        ? t("toasts.success.changePasswordSuccess")
        : t("toasts.success.createPasswordSuccess");

      toast.success(successMsg);
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });

      // Sau khi tạo password thành công → cập nhật lại accountType
      setAccountType((prev) => ({ ...prev, hasPassword: true }));
    } catch (error) {
      toast.error(error.response?.message || error.response?.data?.message || t("toasts.error.currentPasswordWrong"));
    } finally {
      setLoadingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Tài khoản Google thuần → không cần password
    if (accountType.hasPassword && !deletePassword) {
      toast.warn(t("toasts.warn.missingFields"));
      return;
    }
    try {
      await AuthService.deleteAccount(accountType.hasPassword ? deletePassword : undefined);
      toast.success(t("toasts.success.deleteAccountSuccess"));
      setDeleteDialogOpen(false);
      dispatch(logoutStart());
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.message || error.response?.data?.message || t("toasts.error.deleteAccountError"));
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        <div className="shrink-0">
          <AccountSidebar />
        </div>
        <div className="flex-1 overflow-y-auto bg-background/50">
          <div className="container mx-auto px-8 py-8 max-w-6xl space-y-8 pb-20">

            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <User className="h-8 w-8" /> {t("layout.profile.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("layout.profile.subtitle")}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("layout.profile.personalInfo.cardTitle")}</CardTitle>
                <CardDescription>{t("layout.profile.personalInfo.cardDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">{t("layout.profile.personalInfo.fullNameLabel")}</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      placeholder={t("layout.profile.personalInfo.fullNamePlaceholder")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t("layout.profile.personalInfo.emailLabel")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loadingProfile} className="hover:bg-gray-100">
                      {loadingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      {t("layout.profile.personalInfo.saveButton")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* FORM 2: ĐỔI / TẠO MẬT KHẨU */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {loadingAccountType
                    ? t("layout.profile.changePassword.cardTitle")
                    : accountType.hasPassword
                      ? t("layout.profile.changePassword.cardTitle")
                      : t("layout.profile.changePassword.createPasswordTitle")}
                </CardTitle>
                <CardDescription>
                  {loadingAccountType
                    ? t("layout.profile.changePassword.cardDescription")
                    : accountType.hasPassword
                      ? t("layout.profile.changePassword.cardDescription")
                      : t("layout.profile.changePassword.createPasswordDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {accountType.hasPassword && (
                    <div className="grid gap-2">
                      <Label>{t("layout.profile.changePassword.currentPasswordLabel")}</Label>
                      <Input
                        type="password"
                        value={passData.currentPassword}
                        onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t("layout.profile.changePassword.newPasswordLabel")}</Label>
                      <Input
                        type="password"
                        value={passData.newPassword}
                        onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                        placeholder={t("layout.profile.changePassword.newPasswordPlaceholder")}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t("layout.profile.changePassword.confirmPasswordLabel")}</Label>
                      <Input
                        type="password"
                        value={passData.confirmPassword}
                        onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="outline" disabled={loadingPass || loadingAccountType} className="hover:bg-gray-100">
                      {loadingPass ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {accountType.hasPassword
                        ? t("layout.profile.changePassword.submitButton")
                        : t("layout.profile.changePassword.createPasswordBtn")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* FORM 3: XÓA TÀI KHOẢN */}
            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> {t("layout.profile.deleteAccount.cardTitle")}
                </CardTitle>
                <CardDescription className="text-red-600/80">
                  {t("layout.profile.deleteAccount.cardDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-red-600">
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto hover:bg-gray-200">
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" /> {t("layout.profile.deleteAccount.deleteButton")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("layout.profile.deleteAccount.dialogTitle")}</DialogTitle>
                      <DialogDescription>
                        {t("layout.profile.deleteAccount.dialogDescription")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      {accountType.hasPassword ? (
                        <Input
                          type="password"
                          placeholder={t("layout.profile.deleteAccount.passwordPlaceholder")}
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {t("layout.profile.deleteAccount.googleAccountNote", "Tài khoản Google không cần xác minh mật khẩu.")}
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="destructive" className="hover:bg-gray-200" onClick={() => setDeleteDialogOpen(false)}>
                        {t("layout.profile.deleteAccount.cancelButton")}
                      </Button>
                      <Button variant="destructive" className="hover:bg-gray-200 text-red-600" onClick={handleDeleteAccount}>
                        {t("layout.profile.deleteAccount.confirmButton")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}