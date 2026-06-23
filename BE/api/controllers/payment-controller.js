import PaymentService from "../services/paymentService.js";

class PaymentController {
  static async getPendingPayment(req, res) {
    try {
      const result = await PaymentService.getPendingPayment(req.user.userId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get pending payment error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async cancelPendingPayment(req, res) {
    try {
      const result = await PaymentService.cancelPendingPayment(req.user.userId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Cancel pending payment error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getPaymentHistory(req, res) {
    try {
      const result = await PaymentService.getPaymentHistory(req.user.userId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get Payment History Error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getCurrentSubscription(req, res) {
    try {
      const result = await PaymentService.getCurrentSubscription(req.user.userId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get current subscription error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async createSepayPayment(req, res) {
    try {
      const result = await PaymentService.createSepayPayment(req.user.userId, req.body);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Sepay payment creation error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async sepayWebhook(req, res) {
    try {
      const webhookData = {
        authHeader: req.headers["authorization"],
        content: req.body.content,
        transferAmount: req.body.transferAmount
      };
      const result = await PaymentService.sepayWebhook(webhookData);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("SePay Webhook Error:", error);
      res.status(500).json({ success: false, message: "Internal Error" });
    }
  }

  static async downgradeExpiredSubscriptions() {
    try {
      await PaymentService.downgradeExpiredSubscriptions();
    } catch (error) {
      console.error("[CRON] Lỗi hạ cấp EXPIRED:", error);
    }
  }

  static async cancelPendingSubscriptions() {
    try {
      return await PaymentService.cancelPendingSubscriptions();
    } catch (error) {
      console.error("[CRON JOB] Lỗi khi hủy giao dịch:", error);
    }
  }
}

export default PaymentController;