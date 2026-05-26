import { chatWithAgent, syncBookToVector } from "../services/rag-service.js";

export const chat = async (req, res) => {
    try {
        // Nhận tin nhắn và tên sách đang mở từ Frontend
        const { message, currentBookTitle, currentChapterId } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập câu hỏi." });
        }
        const userName = req.user?.full_name;
        // Gọi luồng xử lý AI
        const result = await chatWithAgent(message, currentBookTitle, currentChapterId, userName);

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

export const syncBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        if (!bookId) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp bookId." });
        }
        // Gọi luồng băm sách và tạo Vector
        const result = await syncBookToVector(bookId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error("Lỗi Controller Sync:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi đồng bộ Vector." });
    }
};