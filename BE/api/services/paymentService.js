import { User } from "../models/user-model.js";
import Subscription from "../models/subscription-model.js";
import { Op } from "sequelize";

class PaymentService {
  static getPackageAmount(packageDetails) {
    const prices = {
      "3_THANG": 99000,
      "6_THANG": 179000,
      "12_THANG": 299000,
    };
    return prices[packageDetails] || 0;
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

  static async getPendingPayment(userId) {
    const pending = await Subscription.findOne({
      where: { user_id: userId, status: 'PENDING' },
      order: [['start_date', 'DESC']]
    });
    if (!pending) return { statusCode: 200, data: { success: true, data: null } };
    
    return {
      statusCode: 200,
      data: {
        success: true,
        data: {
          orderId: pending.payment_transaction_id,
          amount: PaymentService.getPackageAmount(pending.package_details),
          bankAccount: process.env.SEPAY_BANK_ACCOUNT,
          bankName: process.env.SEPAY_BANK_NAME,
          packageDetails: pending.package_details,
          createdAt: pending.start_date
        }
      }
    };
  }

  static async cancelPendingPayment(userId) {
    const [updated] = await Subscription.update(
      { status: "CANCELLED" },
      { where: { user_id: userId, status: "PENDING" } }
    );
    if (updated === 0) {
      return { statusCode: 404, data: { success: false, message: "Không tìm thấy đơn thanh toán đang chờ" } };
    }
    console.log(`User ${userId} đã hủy đơn PENDING`);
    return { statusCode: 200, data: { success: true, message: "Đã hủy đơn thanh toán" } };
  }

  static async getPaymentHistory(userId) {
    const subscriptions = await Subscription.findAll({
      where: { user_id: userId },
      order: [["start_date", "DESC"]]
    });
    return { statusCode: 200, data: { success: true, data: subscriptions } };
  }

  static async getCurrentSubscription(userId) {
    const now = new Date();
    const subscription = await Subscription.findOne({
      where: { user_id: userId, status: "ACTIVE" },
      order: [["expiry_date", "DESC"]]
    });

    if (subscription && new Date(subscription.expiry_date) < now) {
      subscription.status = "EXPIRED";
      await subscription.save();
      await User.update({ tier: "FREE" }, { where: { user_id: userId } });
      return { statusCode: 200, data: { success: true, data: { subscription: null, isExpired: true } } };
    }

    if (subscription) {
      const daysRemaining = Math.ceil((new Date(subscription.expiry_date) - now) / (1000 * 60 * 60 * 24));
      return {
        statusCode: 200,
        data: {
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
        }
      };
    }

    return { statusCode: 200, data: { success: true, data: { subscription: null, isExpired: false } } };
  }

  static async createSepayPayment(userId, body) {
    const { package_details } = body;
    const amount = PaymentService.getPackageAmount(package_details);
    if (!package_details || !amount) {
      return { statusCode: 400, data: { success: false, message: "Gói không hợp lệ" } };
    }

    const orderId = `DH${Date.now()}`;
    await Subscription.create({
      user_id: userId,
      package_details,
      amount,
      start_date: new Date(),
      expiry_date: PaymentService.calculateExpiryDate(package_details),
      payment_transaction_id: orderId,
      status: "PENDING"
    });
    console.log(`Sepay: Đã tạo đơn ${orderId} cho User ${userId}`);
    return {
      statusCode: 200,
      data: {
        success: true,
        data: {
          orderId,
          amount,
          bankAccount: process.env.SEPAY_BANK_ACCOUNT,
          bankName: process.env.SEPAY_BANK_NAME
        }
      }
    };
  }

  static async sepayWebhook(webhookData) {
    const authHeader = webhookData.authHeader;
    const mySecretKey = process.env.SEPAY_API_KEY;

    if (!mySecretKey || !authHeader || !authHeader.includes(mySecretKey)) {
      console.log("SePay Webhook: Từ chối truy cập (Sai Token)");
      return { statusCode: 401, data: { success: false, message: "Unauthorized" } };
    }

    const { content, transferAmount } = webhookData;
    if (!content) return { statusCode: 200, data: { success: true, message: "No content" } };

    const match = content.match(/DH\d+/);
    if (!match) {
      console.log("SePay: Không tìm thấy mã đơn hàng");
      return { statusCode: 200, data: { success: true, message: "Ignored" } };
    }

    const orderId = match[0];
    const subscription = await Subscription.findOne({
      where: { payment_transaction_id: orderId, status: "PENDING" }
    });

    if (!subscription) {
      return { statusCode: 200, data: { success: true, message: "Sub not found" } };
    }

    const expectedAmount = Number(subscription.amount) || PaymentService.getPackageAmount(subscription.package_details);
    if (Number(transferAmount) < expectedAmount) {
      return { statusCode: 200, data: { success: true, message: "Insufficient amount" } };
    }

    const monthsMap = { "3_THANG": 3, "6_THANG": 6, "12_THANG": 12 };
    const monthsToAdd = monthsMap[subscription.package_details] || 0;

    const lastActiveSub = await Subscription.findOne({
      where: { user_id: subscription.user_id, status: "ACTIVE" },
      order: [["expiry_date", "DESC"]]
    });

    let baseDate = new Date();
    if (lastActiveSub && lastActiveSub.expiry_date && new Date(lastActiveSub.expiry_date) > new Date()) {
      baseDate = new Date(lastActiveSub.expiry_date);
    }

    const newExpiryDate = new Date(baseDate);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + monthsToAdd);
    
    subscription.status = "ACTIVE";
    subscription.expiry_date = newExpiryDate;
    await subscription.save();

    await User.update({ tier: "PREMIUM" }, { where: { user_id: subscription.user_id } });
    console.log(`SePay Success: User ${subscription.user_id} đã lên Premium, hạn đến ${newExpiryDate}`);
    return { statusCode: 200, data: { success: true, message: "Success" } };
  }

  static async downgradeExpiredSubscriptions() {
    const now = new Date();
    const expiredSubs = await Subscription.findAll({
      where: { status: "ACTIVE", expiry_date: { [Op.lt]: now } }
    });

    if (expiredSubs.length > 0) {
      const userIds = [...new Set(expiredSubs.map(s => s.user_id))];
      await Subscription.update({ status: "EXPIRED" }, { where: { status: "ACTIVE", expiry_date: { [Op.lt]: now } } });

      const usersToDowngrade = [];
      for (const userId of userIds) {
        const stillHasActiveSub = await Subscription.findOne({
          where: { user_id: userId, status: "ACTIVE", expiry_date: { [Op.gt]: now } }
        });
        if (!stillHasActiveSub) {
          usersToDowngrade.push(userId);
        }
      }

      if (usersToDowngrade.length > 0) {
        await User.update({ tier: "FREE" }, { where: { user_id: { [Op.in]: usersToDowngrade } } });
        console.log(`[CRON] Đã hạ cấp ${usersToDowngrade.length} user về FREE`);
      }
    }
  }

  static async cancelPendingSubscriptions() {
    const now = new Date();
    const timeoutLimit = new Date(now.getTime() - 15 * 60 * 1000);

    const [updatedRows] = await Subscription.update(
      { status: "CANCELLED" },
      { where: { status: "PENDING", start_date: { [Op.lt]: timeoutLimit } } }
    );

    if (updatedRows > 0) {
      console.log(`[CRON JOB] Đã tự động hủy ${updatedRows} giao dịch PENDING quá hạn`);
    }
    return true;
  }
}

export default PaymentService;