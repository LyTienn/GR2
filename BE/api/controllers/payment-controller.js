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
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      await Subscription.update(
        { status: "CANCELLED" },
        {
          where: {
            user_id: userId,
            status: "PENDING",
            start_date: { [Op.lt]: fiveMinutesAgo }
          }
        }
      );

      await Subscription.update(
        { status: "EXPIRED" },
        {
          where: {
            user_id: userId,
            status: "ACTIVE",
            expiry_date: { [Op.lt]: now }
          }
        }
      );

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

//   static async getPaymentById(req, res) {
//   try {
//     const { id } = req.params;
//     const userId = req.user.userId;
//     const sub = await Subscription.findOne({
//       where: {
//         subscription_id: id,
//         user_id: userId,
//       },
//     });
//     if (!sub) {
//       return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
//     }

//     let qrUrl = null;
//     if (sub.payment_transaction_id && sub.status === "PENDING") {
//       const bankAccount = process.env.SEPAY_BANK_ACCOUNT;
//       const bankName = process.env.SEPAY_BANK_NAME;
//       const amount = sub.amount || PaymentController.getPackageAmount(sub.package_details);
//       const content = sub.payment_transaction_id;

//       qrUrl = `https://qr.sepay.vn/img?bank=${bankName}&acc=${bankAccount}&template=compact&amount=${amount}&des=${content}`;
//     }

//     res.json({
//       success: true,
//       data: {
//         id: sub.subscription_id,
//         transactionId: sub.payment_transaction_id,
//         package: sub.package_details,
//         amount: sub.amount || PaymentController.getPackageAmount(sub.package_details),
//         status: sub.status,
//         statusText: PaymentController.getStatusText(sub.status),
//         startDate: sub.start_date,
//         expiryDate: sub.expiry_date,
//         qrUrl, 
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// }

  // static getVNPayMessage(responseCode) {
  //   const messages = {
  //     "00": "Giao dịch thành công",
  //     "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)",
  //     "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng",
  //     10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
  //     11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán",
  //     12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
  //     13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)",
  //     24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
  //     51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
  //     65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
  //     75: "Ngân hàng thanh toán đang bảo trì",
  //     79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định",
  //     99: "Các lỗi khác",
  //   };

  //   return messages[responseCode] || "Lỗi không xác định";
  // }

  // static async createPaymentUrl(req, res) {
  //   try {
  //     const { package_details, amount } = req.body;
  //     const userId = req.user.userId;

  //     // VNPay config
  //     const vnp_TmnCode = process.env.VNP_TMN_CODE;
  //     const vnp_HashSecret = process.env.VNP_HASH_SECRET;
  //     const vnp_Url = process.env.VNP_URL;
  //     const vnp_ReturnUrl = process.env.VNP_RETURN_URL;

  //     if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrl) {
  //       return res.status(500).json({
  //         success: false,
  //         message: "VNPay environment variables missing",
  //       });
  //     }

  //     if (!package_details || !amount) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Missing package_details or amount",
  //       });
  //     }

  //     // Validate amount
  //     const amountNumber = Number(amount);
  //     if (isNaN(amountNumber) || amountNumber <= 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Invalid amount",
  //       });
  //     }

  //     // Order ID
  //     const orderId = Date.now().toString();

  //     // IP Address (fix IPv6)
  //     let ipAddr =
  //       req.headers["x-forwarded-for"] ||
  //       req.connection?.remoteAddress ||
  //       req.socket?.remoteAddress ||
  //       "127.0.0.1";

  //     if (ipAddr.includes("::ffff:")) {
  //       ipAddr = ipAddr.replace("::ffff:", "");
  //     }
  //     ipAddr = ipAddr.split(",")[0].trim();

  //     // Create date: yyyyMMddHHmmss
  //     const date = new Date();
  //     const createDate = [
  //       date.getFullYear(),
  //       String(date.getMonth() + 1).padStart(2, "0"),
  //       String(date.getDate()).padStart(2, "0"),
  //       String(date.getHours()).padStart(2, "0"),
  //       String(date.getMinutes()).padStart(2, "0"),
  //       String(date.getSeconds()).padStart(2, "0"),
  //     ].join("");

  //     let vnp_Params = {
  //       vnp_Version: "2.1.0",
  //       vnp_Command: "pay",
  //       vnp_TmnCode: vnp_TmnCode,
  //       vnp_Locale: "vn",
  //       vnp_CurrCode: "VND",
  //       vnp_TxnRef: orderId,
  //       vnp_OrderInfo: `Thanh toan goi ${package_details}`,
  //       vnp_OrderType: "other",
  //       vnp_Amount: Math.floor(amountNumber * 100),
  //       vnp_ReturnUrl: vnp_ReturnUrl,
  //       vnp_IpAddr: ipAddr,
  //       vnp_CreateDate: createDate,
  //     };

      //   if (vnp_IpnUrl) {
      //     vnp_Params.vnp_IpnUrl = vnp_IpnUrl;
      //   }

  //     vnp_Params = PaymentController.sortObject(vnp_Params);

  //     const signData = new URLSearchParams(vnp_Params).toString();
  //     const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  //     const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  //     vnp_Params["vnp_SecureHash"] = signed;

  //     const paymentUrl =
  //       vnp_Url + "?" + new URLSearchParams(vnp_Params).toString();

  //     // Save subscription (PENDING)
  //     await Subscription.create({
  //       user_id: userId,
  //       package_details,
  //       start_date: new Date(),
  //       expiry_date: PaymentController.calculateExpiryDate(package_details),
  //       payment_transaction_id: orderId,
  //       status: "PENDING",
  //     });

  //     console.log("✅ Created payment URL for order:", orderId);

  //     return res.status(200).json({
  //       success: true,
  //       data: { paymentUrl },
  //     });
  //   } catch (error) {
  //     console.error("❌ Create payment error:", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Server error",
  //       error: error.message,
  //     });
  //   }
  // }

  // static async vnpayReturn(req, res) {
  //   try {
  //     let vnp_Params = req.query;
  //     const secureHash = vnp_Params["vnp_SecureHash"];

  //     // Remove hash từ params trước khi verify
  //     delete vnp_Params["vnp_SecureHash"];
  //     delete vnp_Params["vnp_SecureHashType"];

  //     // Sort params
  //     vnp_Params = PaymentController.sortObject(vnp_Params);

  //     // Tạo chữ ký để verify
  //     const signData = new URLSearchParams(vnp_Params).toString();
  //     const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
  //     const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  //     console.log("🔐 VNPay Callback - Received Hash:", secureHash);
  //     console.log("🔐 VNPay Callback - Calculated Hash:", signed);

  //     // Kiểm tra chữ ký
  //     if (secureHash !== signed) {
  //       console.error("❌ Invalid signature");
  //       return res.redirect(
  //         `${process.env.FRONTEND_URL}/payment/failed?reason=invalid_signature`
  //       );
  //     }

  //     const orderId = vnp_Params["vnp_TxnRef"];
  //     const responseCode = vnp_Params["vnp_ResponseCode"];
  //     const transactionNo = vnp_Params["vnp_TransactionNo"];
  //     const bankCode = vnp_Params["vnp_BankCode"];
  //     const amount = vnp_Params["vnp_Amount"];

  //     console.log("📋 Order ID:", orderId);
  //     console.log("📋 Response Code:", responseCode);
  //     console.log("📋 Transaction No:", transactionNo);
  //     console.log("📋 Bank:", bankCode);

  //     // Tìm subscription
  //     const subscription = await Subscription.findOne({
  //       where: { payment_transaction_id: orderId },
  //     });

  //     if (!subscription) {
  //       console.error("❌ Subscription not found:", orderId);
  //       return res.redirect(
  //         `${process.env.FRONTEND_URL}/payment/failed?reason=order_not_found`
  //       );
  //     }

  //     //  Kiểm tra đã xử lý chưa (idempotency)
  //     if (subscription.status === "ACTIVE") {
  //       console.log("⚠️ Order already processed:", orderId);
  //       return res.redirect(
  //         `${process.env.FRONTEND_URL}/payment/success?already_processed=true`
  //       );
  //     }

  //     if (subscription.status === "CANCELLED") {
  //       console.log("⚠️ Order already cancelled:", orderId);
  //       return res.redirect(
  //         `${process.env.FRONTEND_URL}/payment/failed?reason=already_cancelled`
  //       );
  //     }

  //     if (responseCode === "00") {
  //       // ========== THANH TOÁN THÀNH CÔNG ==========
  //       subscription.status = "ACTIVE";
  //       await subscription.save();

  //       await User.update(
  //         { tier: "PREMIUM" },
  //         { where: { user_id: subscription.user_id } }
  //       );

  //       console.log("✅ Payment successful:", orderId);
  //       console.log("✅ User upgraded to PREMIUM:", subscription.user_id);

  //       return res.redirect(
  //         `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}&amount=${amount}`
  //       );
  //     } else {
  //       // ========== THANH TOÁN THẤT BẠI ==========
  //       subscription.status = "CANCELLED";
  //       await subscription.save();

  //       const errorMessage = PaymentController.getVNPayMessage(responseCode);

  //       console.error("❌ Payment failed:", orderId);
  //       console.error("❌ Response Code:", responseCode);
  //       console.error("❌ Reason:", errorMessage);

  //       // Xử lý các trường hợp thất bại cụ thể
  //       let reason = "unknown";

  //       if (responseCode === "24") {
  //         reason = "user_cancelled"; // User hủy
  //       } else if (responseCode === "11") {
  //         reason = "timeout"; // Hết hạn
  //       } else if (responseCode === "51") {
  //         reason = "insufficient_funds"; // Không đủ tiền
  //       } else if (responseCode === "12") {
  //         reason = "card_locked"; // Thẻ bị khóa
  //       } else if (responseCode === "13" || responseCode === "79") {
  //         reason = "wrong_otp"; // Sai OTP
  //       } else if (responseCode === "09") {
  //         reason = "card_not_registered"; // Chưa đăng ký internet banking
  //       } else if (responseCode === "75") {
  //         reason = "bank_maintenance"; // Ngân hàng bảo trì
  //       }

  //       return res.redirect(
  //         `${
  //           process.env.FRONTEND_URL
  //         }/payment/failed?reason=${reason}&code=${responseCode}&message=${encodeURIComponent(
  //           errorMessage
  //         )}`
  //       );
  //     }
  //   } catch (error) {
  //     console.error("❌ VNPay return error:", error);
  //     return res.redirect(
  //       `${process.env.FRONTEND_URL}/payment/failed?reason=server_error`
  //     );
  //   }
  // }

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