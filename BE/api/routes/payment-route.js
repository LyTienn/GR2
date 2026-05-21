import express from "express";
import PaymentController from "../controllers/payment-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";
import { body } from "express-validator";

const router = express.Router();

//--- SEPAY ---
// /api/payment/sepay/create
router.post("/sepay/create", authenticate, PaymentController.createSepayPayment);

//API Webhook (SePay gọi -> Public -> KHÔNG ĐƯỢC CÓ AUTHENTICATE)
// SePay sẽ gọi: /api/payment/sepay/webhook
router.post("/sepay/webhook", PaymentController.sepayWebhook);

//API Lịch sử giao dịch
router.get("/history", authenticate, PaymentController.getPaymentHistory);

//Kiểm tra subscription hiện tại & hạn hội viên
router.get("/subscription/current", authenticate, PaymentController.getCurrentSubscription);

//Lấy pending subscription
router.get("/subscription/pending", authenticate, PaymentController.getPendingPayment);

//Hủy pending subscription 
router.put("/subscription/cancel/:subscriptionId", authenticate, PaymentController.cancelPendingPayment);
export default router;
