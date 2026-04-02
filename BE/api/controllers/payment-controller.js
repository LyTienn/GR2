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
      const userId = req.user.userId;
      
      const subscriptions = await Subscription.findAll({
        where: { user_id: userId },
        order: [["start_date", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      console.error("Get Payment History Error:", error);
      return res.status(500).json({ success: false, message: "Lỗi lấy lịch sử" });
    }
  }

  static async getCurrentSubscription(req, res) {
    try {
    const userId = req.user.userId;
    const now = new Date();

    // Tìm subscription ACTIVE gần nhất
    const subscription = await Subscription.findOne({
      where: {
        user_id: userId,
        status: "ACTIVE"
      },
      order: [["expiry_date", "DESC"]],
      attributes: [
        "subscription_id",
        "package_details",
        "start_date",
        "expiry_date",
        "status"
      ]
    });

    // Nếu hết hạn, tự động downgrade
    if (subscription && new Date(subscription.expiry_date) < now) {
      subscription.status = "EXPIRED";
      await subscription.save();

      await User.update(
        { tier: "FREE" },
        { where: { user_id: userId },
          logging: console.log
        }
      );

      console.log(`✅ Auto-downgraded user ${userId} to FREE (subscription expired)`);

      return res.status(200).json({
        success: true,
        data: {
          subscription: null,
          isExpired: true,
          message: "Gói hội viên đã hết hạn"
        }
      });
    }

    // Nếu còn hạn
    if (subscription) {
      const expiryDate = new Date(subscription.expiry_date);
      const daysRemaining = Math.ceil(
        (expiryDate - now) / (1000 * 60 * 60 * 24)
      );

      return res.status(200).json({
        success: true,
        data: {
          subscription: {
            id: subscription.subscription_id,
            package: subscription.package_details,
            startDate: subscription.start_date,
            expiryDate: subscription.expiry_date,
            isActive: true,
            daysRemaining: daysRemaining
          },
          isExpired: false
        }
      });
    }

    // Không có subscription
    return res.status(200).json({
      success: true,
      data: {
        subscription: null,
        isExpired: false,
        message: "Bạn chưa có gói hội viên"
      }
    });
  } catch (error) {
    console.error("Get current subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
  }

  static async downgradeExpiredSubscriptions() {
    try {
      const now = new Date();
      const expiredSubs = await Subscription.findAll({
        where: { status: "ACTIVE", expiry_date: { [Op.lt]: now } }
      });

      if (expiredSubs.length > 0) {
        const subIds = expiredSubs.map(s => s.id);
        const userIds = expiredSubs.map(s => s.user_id);

        await Subscription.update({ status: "EXPIRED" }, { where: { id: { [Op.in]: subIds } } });
        
        // CHÚ Ý CHỖ NÀY: Dùng id thay vì user_id theo Model của bạn
        await User.update({ tier: "FREE" }, { where: { id: { [Op.in]: userIds } } });
        
        console.log(`[CRON] Đã hạ cấp ${userIds.length} user về FREE.`);
      }
    } catch (error) {
      console.error("[CRON] Lỗi hạ cấp EXPIRED:", error);
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

  // HÀM CHẠY NGẦM (CRON JOB): Hủy các giao dịch PENDING quá hạn (ví dụ: 15 phút)
  static async cancelPendingSubscriptions() {
    try {
      const now = new Date();
      // Đặt thời gian quá hạn là 15 phút (bạn có thể đổi thành 5 tùy logic của bạn)
      const timeoutLimit = new Date(now.getTime() - 15 * 60 * 1000);

      const [updatedRows] = await Subscription.update(
        { status: "CANCELLED" },
        {
          where: {
            status: "PENDING",
            start_date: { [Op.lt]: timeoutLimit } // Tìm các đơn tạo trước thời hạn
          }
        }
      );

      if (updatedRows > 0) {
        console.log(`[CRON JOB] Đã tự động hủy ${updatedRows} giao dịch PENDING quá hạn.`);
      }
      
      return true; // Trả về true để lệnh .then() trong server.js chạy được
    } catch (error) {
      console.error("[CRON JOB] Lỗi khi hủy giao dịch:", error);
      throw error;
    }
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
      await Subscription.create({
        user_id: userId,
        package_details,
        amount: amount,
        start_date: new Date(),
        expiry_date: PaymentController.calculateExpiryDate(package_details),
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