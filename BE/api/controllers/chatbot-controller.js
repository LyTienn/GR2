import { chatWithAgent } from "../services/rag-service.js";

export const chat = async (req, res) => {
    try {
        // Nhận tin nhắn và tên sách đang mở từ Frontend
        const { message, currentBookTitle } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập câu hỏi." });
        }
        const userName = req.user?.full_name;
        // Gọi luồng xử lý AI
        const result = await chatWithAgent(message, currentBookTitle, userName);

        if (result.success) {
            res.status(200).json({ success: true, data: result.reply });
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error("Lỗi Controller Chatbot:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi gọi Chatbot." });
    }
};