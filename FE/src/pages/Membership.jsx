import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star, Shield, ArrowLeft, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import PaymentService from "@/service/PaymentService";
import AuthService from "@/service/AuthService";
import { fetchProfileSuccess } from "@/store/Auth/authSlice";
import HeaderBar from "../components/HeaderBar";

const Membership = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null); 

    const packages = [
        {
            id: "3_THANG",
            name: t("layout.membership.package3m.name"),
            price: 99000,
            period: t("layout.membership.package3m.period"),
            features: [t("layout.membership.package3m.feature1"), t("layout.membership.package3m.feature2")],
            isBestValue: false,
        },
        {
            id: "6_THANG",
            name: t("layout.membership.package6m.name"),
            price: 179000,
            period: t("layout.membership.package6m.period"),
            features: [t("layout.membership.package6m.feature1"), t("layout.membership.package6m.feature2"), t("layout.membership.package6m.feature3")],
            isBestValue: true,
        },
        {
            id: "12_THANG",
            name: t("layout.membership.package12m.name"),
            price: 299000,
            period: t("layout.membership.package12m.period"),
            features: [t("layout.membership.package12m.feature1"), t("layout.membership.package12m.feature2"), t("layout.membership.package12m.feature3")],
            isBestValue: false,
        },
    ];

    const handleUpgrade = async (pkg) => {
        if (!user) {
            toast.error(t("layout.membership.notLogin"));
            return navigate("/login");
        }

        try {
            setLoading(true);
            const res = await PaymentService.createSepayPayment({
                package_details: pkg.id,
                amount: pkg.price,
            });

            if (res.success && res.data) {
                console.log("paymentInfo:", res.data);
                setPaymentInfo(res.data); 
                toast.info(t("layout.membership.orderCreated"));
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            toast.error(t("layout.membership.orderError"));
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success(t("layout.membership.copiedSuccess"));
    };

    const handleFinish = async () => {
        try {
            const res = await AuthService.getProfile();
            if (res.success && res.data) {
                const updatedUser = res.data || res.data.user;
                
                if (updatedUser.tier === 'PREMIUM') {
                    dispatch(fetchProfileSuccess(updatedUser));
                    setPaymentInfo(null);
                    toast.success(t("layout.membership.upgradeSuccess", "Nâng cấp Premium thành công!"));
                } else {
                    toast.info(t("layout.membership.processing", "Hệ thống đang xử lý giao dịch. Vui lòng giữ màn hình và đợi trong giây lát..."));
                }
            }
        } catch (error) {
            console.error("Lỗi kiểm tra trạng thái:", error);
            toast.error("Có lỗi xảy ra khi kiểm tra trạng thái.");
        }
    };

    const handleCancelPending = async () => {
        try {
            setLoading(true);
            // Lưu ý: Route BE của bạn là /cancel/:subscriptionId, 
            // nhưng Controller BE đang update dựa vào user_id & status="PENDING" chứ không dùng params. 
            // Nên truyền đại id='current' hoặc orderId đều được.
            const res = await PaymentService.cancelPendingPayment();
            
            if (res.success) {
                setPaymentInfo(null); // Đóng màn hình QR
                toast.success(res.message || "Đã hủy giao dịch thành công.");
            }
        } catch (error) {
            console.error("Lỗi hủy đơn:", error);
            toast.error("Không thể hủy giao dịch lúc này.");
        } finally {
            setLoading(false);
        }
    };

    //Check pending subcription
    useEffect(() => {
        const checkPendingPayment = async () => {
            if (!user || user.tier === 'PREMIUM') return;
            try {
                const res = await PaymentService.getPendingPayment();
                if (res.success && res.data) {
                    setPaymentInfo(res.data);
                    toast.info(t("layout.membership.hasPending"));
                }
            } catch (error) {
                console.error("Lỗi fetch pending payment:", error);
            }
        };
        checkPendingPayment();
    }, [user]);

    useEffect(() => {
        let interval;
        if (paymentInfo) {
            interval = setInterval(async () => {
                try {
                    const res = await AuthService.getProfile();
                    if (res.success && res.data) {
                        const updatedUser = res.data || res.data.user;
                        console.log("Polling User Tier:", updatedUser.tier);
                        if (updatedUser.tier === 'PREMIUM') {
                            setPaymentInfo(null);
                            clearInterval(interval);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [paymentInfo, dispatch]);

    // VIEW THANH TOÁN (QR)
    if (paymentInfo) {
        const { bankAccount, bankName, amount, orderId } = paymentInfo;
        const qrUrl = `https://qr.sepay.vn/img?bank=${bankName}&acc=${bankAccount}&template=compact&amount=${amount}&des=${orderId}`;
        return (
            <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
                <div className="shrink-0"><HeaderBar /></div>
                
                <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-200 relative mt-8 mb-12">
                        <Button 
                            onClick={() => setPaymentInfo(null)} 
                            className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 flex items-center text-sm"
                            variant="ghost"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" /> {t("layout.membership.payment.backBtn")}
                        </Button>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2 mt-6">{t("layout.membership.payment.title")}</h2>
                        <p className="text-slate-500 mb-6 text-sm">{t("layout.membership.payment.description")}</p>

                        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-inner mb-6 inline-block">
                            <img src={qrUrl} alt="Mã QR Thanh toán" referrerPolicy="no-referrer" className="w-64 h-64 object-contain" />
                        </div>

                        <div className="text-left bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm mb-6 space-y-3">
                            <div className="flex justify-between border-b border-yellow-200 pb-2">
                                <span className="text-slate-600">{t("layout.membership.bankInfo.bank")}</span>
                                <span className="font-bold text-slate-800">{bankName}</span>
                            </div>
                            <div className="flex justify-between border-b border-yellow-200 pb-2">
                                <span className="text-slate-600">{t("layout.membership.bankInfo.account")}</span>
                                <span className="font-bold text-slate-800 tracking-wider">{bankAccount}</span>
                            </div>
                            <div className="flex justify-between border-b border-yellow-200 pb-2">
                                <span className="text-slate-600">{t("layout.membership.bankInfo.amount")}</span>
                                <span className="font-bold text-red-600 text-lg">{amount.toLocaleString()}đ</span>
                            </div>

                            <div className="pt-1">
                                <p className="text-xs text-slate-500 mb-1">{t("layout.membership.bankInfo.content")}</p>
                                <div className="flex gap-2">
                                    <div className="flex-1 text-lg font-mono font-bold text-blue-700 bg-white p-2 rounded border border-dashed border-blue-300 text-center">
                                        {orderId}
                                    </div>
                                    <Button variant="outline" size="icon" onClick={() => handleCopy(orderId)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={handleFinish}
                                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-semibold shadow-lg shadow-green-200"
                            >
                                {t("layout.membership.paymentConfirm.button")}
                            </Button>
                            <Button
                                onClick={handleCancelPending}
                                disabled={loading}
                                variant="destructive"
                                className="w-full h-12 text-lg font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : t("layout.membership.cancelPayment", "Hủy giao dịch này")}
                            </Button>
                            <p className="text-xs text-slate-400">
                                {t("layout.membership.paymentConfirm.helper")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // VIEW DANH SÁCH GÓI
    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Header giữ nguyên vị trí */}
            <div className="shrink-0 z-20">
                <HeaderBar />
            </div>

            {/* Vùng nội dung cuộn bên dưới */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-16">
                
                {/* Nút Back được ghim ở góc trên bên trái của khu vực cuộn */}
                <div className="sticky top-6 left-4 md:left-8 z-30 w-fit">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-md border-slate-200 shadow-sm rounded-full flex items-center gap-2 pr-5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t("layout.membership.backBtn")}
                    </Button>
                </div>

                <div className="max-w-6xl mx-auto px-4 pt-4 md:pt-0">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">{t("layout.membership.title")}</h1>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                            {t("layout.membership.description")}
                        </p>
                    </div>

                    {user?.tier === 'PREMIUM' && (
                        <div className="mb-10 p-6 bg-linear-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl flex items-center gap-5 shadow-sm px-8">
                            <div className="p-4 bg-yellow-400/20 rounded-full shrink-0">
                                <Star className="h-8 w-8 text-yellow-600 fill-yellow-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-yellow-900 text-xl mb-1">
                                    {t("layout.membership.alreadyPremium.title")}
                                </h3>
                                <p className="text-sm text-yellow-800/80">
                                    {t("layout.membership.extendDescription")}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Grid Packages */}
                    <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`flex flex-col bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 relative border
                                ${pkg.isBestValue ? 'border-2 border-yellow-400 transform lg:-translate-y-2 z-10 shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-blue-200 hover:-translate-y-1'}
                                `}
                            >
                                {pkg.isBestValue && (
                                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-2xl shadow-sm tracking-wide">
                                        {t("layout.membership.package6m.badge")}
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                    {pkg.isBestValue && <Star className="fill-yellow-400 text-yellow-400 h-5 w-5" />}
                                    {pkg.name}
                                </h3>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{pkg.price.toLocaleString()}đ</span>
                                    <span className="text-slate-500 text-sm font-medium"> / {pkg.period}</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                            <Check className={`h-5 w-5 shrink-0 ${pkg.isBestValue ? 'text-yellow-500' : 'text-blue-500'}`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => handleUpgrade(pkg)}
                                    disabled={loading}
                                    className={`w-full h-12 text-lg font-bold transition-all mt-auto rounded-xl
                                        ${pkg.isBestValue
                                            ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-yellow-200 shadow-lg hover:shadow-yellow-300'
                                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg'}
                                    `}
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : (user?.tier === 'PREMIUM' ? t("layout.membership.extendBtn") : t("layout.membership.upgradeBtn", "Nâng cấp ngay"))}
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12 text-slate-400 text-sm">
                        <p className="flex items-center justify-center gap-2">
                            <Shield className="h-4 w-4" /> {t("layout.membership.security")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Membership;