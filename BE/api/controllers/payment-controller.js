import crypto from "crypto";
import { User } from "../models/user-model.js";
import Subscription from "../models/subscription-model.js";
import { Op } from "sequelize";

class PaymentController {
  static sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();

    keys.forEach((key) => {
      sorted[key] = obj[key];
    });

    return sorted;
  }

  static getPackageAmount(packageDetails) {
    const prices = {
      "3_THANG": 99000,
      "6_THANG": 179000,
      "12_THANG": 299000,
    };
    return prices[packageDetails] || 0;
  }

  static getStatusText(status) {
    const statusMap = {
      PENDING: "Đang xử lý",
      ACTIVE: "Thành công",
      CANCELLED: "Thanh toán thất bại",
      EXPIRED: "Đã hết hạn",
    };
    return statusMap[status] || "Không xác định";
  }

  static async getPaymentHistory(req, res) {
    try {
      const userId = req.user.userId; // Từ middleware authenticate

      const subscriptions = await Subscription.findAll({
        where: { user_id: userId },
        order: [["start_date", "DESC"]],
        attributes: [
          "subscription_id",
          "package_details",
          "start_date",
          "expiry_date",
          "payment_transaction_id",
          "status",
        ],
      });

      // Map sang format dễ đọc hơn
      const history = subscriptions.map((sub) => ({
        id: sub.subscription_id,
        transactionId: sub.payment_transaction_id,
        package: sub.package_details,
        amount: PaymentController.getPackageAmount(sub.package_details),
        status: sub.status,
        statusText: PaymentController.getStatusText(sub.status),
        startDate: sub.start_date,
        expiryDate: sub.expiry_date,
      }));

      res.status(200).json({
        success: true,
        data: { history },
      });
    } catch (error) {
      console.error("Get payment history error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  static calculateExpiryDate(package_details) {
    const now = new Date();

    if (package_details === "3_THANG") {
      now.setMonth(now.getMonth() + 3);
    } else if (package_details === "6_THANG") {
      now.setMonth(now.getMonth() + 6);
    } else if (package_details === "12_THANG") {
      now.setMonth(now.getMonth() + 12);
    }

    return now;
  }

  // SEPAY PAYMENT (CHUYỂN KHOẢN NGÂN HÀNG)
  static async createSepayPayment(req, res) {
    try {
      const { package_details, amount } = req.body;
      const userId = req.user.userId;
      if (!package_details || !amount) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin gói hoặc số tiền" });
      }

      const orderId = `DH${Date.now()}`;
      const now = new Date();
      const expiryPending = new Date(now.getTime() + 1 * 60 * 1000); // +1 phút

      await Subscription.create({
        user_id: userId,
        package_details,
        amount: amount,
        start_date: new Date(),
        expiry_date: expiryPending,
        payment_transaction_id: orderId,
        status: "PENDING",
      });
      console.log(`Sepay: Đã tạo đơn ${orderId} cho User ${userId}`);
      return res.status(200).json({
        success: true,
        data: {
          orderId,
          amount,
          bankAccount: process.env.SEPAY_BANK_ACCOUNT,
          bankName: process.env.SEPAY_BANK_NAME,
        },
      });
    } catch (error) {
      console.error("Sepay payment creation error:", error);
      res.status(500).json({ success: false, message: "Lỗi tạo đơn hàng" });
    }
  }

  //WEBHOOK XỬ LÝ THANH TOÁN (SePay gọi tự động khi có tiền vào)
  static async sepayWebhook(req, res) {
    try {
      // --- BẢO MẬT ---
      // SePay gửi token qua Header: "Authorization: Bearer <SECRET_KEY>"
      const authHeader = req.headers["authorization"]; 
      const mySecretKey = process.env.SEPAY_API_KEY;
      
      console.log("--- DEBUG WEBHOOK ---");
      console.log("1. Header SePay gửi sang:", authHeader);
      console.log("2. Key trong .env của mình:", mySecretKey);

      if (!mySecretKey || !authHeader || !authHeader.includes(mySecretKey)) {
        console.log("SePay Webhook: Từ chối truy cập (Sai Token)");
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const data = req.body;
      console.log("SePay Webhook Data:", JSON.stringify(data));
      const { content, transferAmount } = data;
      if (!content) return res.json({ success: true, message: "No content" });
    
      const match = content.match(/DH\d+/);
      if (!match) {
        console.log("SePay: Không tìm thấy mã đơn hàng trong nội dung:", content);
        return res.json({ success: true, message: "Ignored (No Order ID)" });
      }

      const orderId = match[0]; 
      const subscription = await Subscription.findOne({
        where: { 
            payment_transaction_id: orderId,
            status: "PENDING"
        },
      });

      if (!subscription) {
        console.log("SePay: Không tìm thấy đơn hàng PENDING khớp mã:", orderId);
        return res.json({ success: true, message: "Sub not found or processed" });
      }
      // Kiểm tra số tiền (Cho phép sai số nhỏ hoặc phải >= giá gói)
      // Sử dụng số tiền đã lưu trong DB để so sánh
      const expectedAmount = Number(subscription.amount) || PaymentController.getPackageAmount(subscription.package_details);
      
      if (Number(transferAmount) < expectedAmount) {
         console.log(`SePay: Tiền thiếu. Cần ${expectedAmount}, Nhận ${transferAmount}`);
         return res.json({ success: true, message: "Insufficient amount" });
      }

      //Cập nhật trạng thái giao dịch thành công
      subscription.status = "ACTIVE";
      await subscription.save();

      //Nâng cấp User lên Premium
      await User.update(
        { tier: "PREMIUM" },
        { where: { user_id: subscription.user_id } }
      );
      console.log(`SePay Success: User ${subscription.user_id} đã lên Premium qua đơn ${orderId}`);
      return res.status(200).json({ success: true, message: "Success" });
    } catch (error) {
      console.error("SePay Webhook Error:", error);
      return res.status(200).json({ success: false, message: "Server Error" });
    }
  }
}

export default PaymentController;
