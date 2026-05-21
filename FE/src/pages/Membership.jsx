import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star, Shield, ArrowLeft, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import PaymentService from "@/service/PaymentService";
import AuthService from "@/service/AuthService";
// import { setUser } from "@/store/Auth/authSlice";

const Membership = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null); // Lưu thông tin đơn hàng

    const packages = [
        {
            id: "3_THANG",
            name: t("membership.package3m.name"),
            price: 99000,
            period: t("membership.package3m.period"),
            features: [t("membership.package3m.feature1"), t("membership.package3m.feature2")],
            isBestValue: false,
        },
        {
            id: "6_THANG",
            name: t("membership.package6m.name"),
            price: 179000,
            period: t("membership.package6m.period"),
            features: [t("membership.package6m.feature1"), t("membership.package6m.feature2"), t("membership.package6m.feature3")],
            isBestValue: true,
        },
        {
            id: "12_THANG",
            name: t("membership.package12m.name"),
            price: 299000,
            period: t("membership.package12m.period"),
            features: [t("membership.package12m.feature1"), t("membership.package12m.feature2"), t("membership.package12m.feature3")],
            isBestValue: false,
        },
    ];

    const handleUpgrade = async (pkg) => {
        if (!user) {
            toast.error(t("membership.notLogin"));
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
                setPaymentInfo(res.data); // Lưu thông tin đơn hàng
                toast.info(t("membership.orderCreated"));
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            toast.error(t("membership.orderError"));
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success(t("membership.copiedSuccess"));
    };

    const handleFinish = () => {
        // Reload để cập nhật lại thông tin User (Tier: PREMIUM) từ Backend
        window.location.href = "/";
    };

    useEffect(() => {
        let interval;
        if (paymentInfo) {
            interval = setInterval(async () => {
                try {
                    const res = AuthService.getProfile();
                    if (res.success && res.data) {
                        const updatedUser = res.data || res.data.user;
                        console.log("Polling User Tier:", updatedUser.tier);
                        if (updatedUser.tier === 'PREMIUM') {
                            // dispatch(setUser(updatedUser));
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

    if (user?.tier === 'PREMIUM') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full border border-yellow-200">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="h-10 w-10 text-yellow-500 fill-yellow-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{t("membership.alreadyPremium.title")}</h2>
                    <p className="text-slate-600 mb-6">{t("membership.alreadyPremium.description")}</p>
                    <Button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                        {t("membership.alreadyPremium.backBtn")}
                    </Button>
                </div>
            </div>
        );
    }

    if (paymentInfo) {
        const { bankAccount, bankName, amount, orderId } = paymentInfo;
        const qrUrl = `https://qr.sepay.vn/img?bank=${bankName}&acc=${bankAccount}&template=compact&amount=${amount}&des=${orderId}`;
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-200 relative">
                    <Button onClick={() => setPaymentInfo(null)} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 flex items-center text-sm">
                        <ArrowLeft className="h-4 w-4 mr-1" /> {t("membership.payment.backBtn")}
                    </Button>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2 mt-4">{t("membership.payment.title")}</h2>
                    <p className="text-slate-500 mb-6 text-sm">{t("membership.payment.description")}</p>

                    {/* QR CODE */}
                    <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-inner mb-6 inline-block">
                        <img src={qrUrl} alt="Mã QR Thanh toán" referrerPolicy="no-referrer" className="w-64 h-64 object-contain" />
                    </div>

                    <div className="text-left bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm mb-6 space-y-3">
                        <div className="flex justify-between border-b border-yellow-200 pb-2">
                            <span className="text-slate-600">{t("membership.bankInfo.bank")}</span>
                            <span className="font-bold text-slate-800">{bankName}</span>
                        </div>
                        <div className="flex justify-between border-b border-yellow-200 pb-2">
                            <span className="text-slate-600">{t("membership.bankInfo.account")}</span>
                            <span className="font-bold text-slate-800 tracking-wider">{bankAccount}</span>
                        </div>
                        <div className="flex justify-between border-b border-yellow-200 pb-2">
                            <span className="text-slate-600">{t("membership.bankInfo.amount")}</span>
                            <span className="font-bold text-red-600 text-lg">{amount.toLocaleString()}đ</span>
                        </div>

                        {/* NỘI DUNG CHUYỂN KHOẢN */}
                        <div className="pt-1">
                            <p className="text-xs text-slate-500 mb-1">{t("membership.bankInfo.content")}</p>
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
                            {t("membership.paymentConfirm.button")}
                        </Button>
                        <p className="text-xs text-slate-400">
                            {t("membership.paymentConfirm.helper")}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            {/* Back Button */}
            <div className="max-w-5xl mx-auto mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t("membership.backBtn")}
                </Button>
            </div>

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800 mb-4">{t("membership.title")}</h1>
                <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                    {t("membership.description")}
                </p>
            </div>

            {/* Grid Packages */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center px-2 md:px-12">

                {packages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className={`bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 relative border
                    ${pkg.isBestValue ? 'border-2 border-yellow-400 transform md:scale-105 z-10' : 'border-slate-200 hover:border-blue-300'}
                `}
                    >
                        {pkg.isBestValue && (
                            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                                {t("membership.package6m.badge")}
                            </div>
                        )}

                        <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                            {pkg.isBestValue && <Star className="fill-yellow-400 text-yellow-400 h-5 w-5" />}
                            {pkg.name}
                        </h3>

                        <div className="mb-6">
                            <span className="text-4xl font-bold text-slate-800">{pkg.price.toLocaleString()}đ</span>
                            <span className="text-slate-400 text-sm font-normal"> / {pkg.period}</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {pkg.features.map((feature, idx) => (
                                <li key={idx} className="flex gap-3 text-slate-700">
                                    <Check className={`h-5 w-5 ${pkg.isBestValue ? 'text-yellow-500' : 'text-blue-500'}`} />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button
                            onClick={() => handleUpgrade(pkg)}
                            disabled={loading}
                            className={`w-full h-12 text-lg font-bold transition-all
                        ${pkg.isBestValue
                                    ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 shadow-yellow-200 shadow-md'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white'}
                    `}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : t("membership.upgradeBtn")}
                        </Button>
                    </div>
                ))}

            </div>

            <div className="text-center mt-12 text-slate-400 text-sm">
                <p className="flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4" /> {t("membership.security")}
                </p>
            </div>
        </div>
    );
}

export default Membership;