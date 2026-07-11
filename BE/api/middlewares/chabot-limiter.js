import rateLimit from "express-rate-limit";
import { Op } from "sequelize";
import Conversation from "../models/conversation-model.js";
import ConversationMessage from "../models/conversation_message-model.js";

// ==========================================
// 1. Middleware chặn spam tức thời (sử dụng RAM)
// ==========================================
export const spamLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 5, // Tối đa 5 requests/phút từ 1 IP
  message: {
    success: false,
    error_code: "SPAM_LIMIT_EXCEEDED",
    message: "Bạn đang gửi câu hỏi quá nhanh. Vui lòng đợi một chút rồi thử lại!"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==========================================
// 2. Middleware giới hạn 5 câu hỏi/ngày (sử dụng Database)
// ==========================================
export const dailyChatLimiter = async (req, res, next) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: "Vui lòng đăng nhập." });
    }

    // Lấy thời điểm bắt đầu ngày hôm nay (00:00:00)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Đếm số tin nhắn của user gửi trong ngày hôm nay
    const chatCount = await ConversationMessage.count({
      where: {
        role: "user",
        created_at: {
          [Op.gte]: startOfToday,
        },
      },
      include: [
        {
          model: Conversation,
          as: "conversation",
          where: { user_id: userId, is_deleted: 0 },
          required: true,
          attributes: []
        },
      ],
    });

    const LIMIT = 5;
    if (chatCount >= LIMIT) {
      return res.status(429).json({
        success: false,
        error_code: "DAILY_LIMIT_EXCEEDED",
        message: `Bạn đã dùng hết ${LIMIT} lượt hỏi chatbot miễn phí của ngày hôm nay. Vui lòng quay lại vào ngày mai!`,
      });
    }

    next();
  } catch (error) {
    console.error("Lỗi khi kiểm tra giới hạn chat:", error);
    next(); // Cho phép đi tiếp nếu lỗi hệ thống
  }
};
