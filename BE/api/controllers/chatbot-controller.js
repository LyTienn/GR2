import { chatWithAgent, syncBookToVector } from "../services/rag-service.js";
import {
  createConversation,
  fetchAllConversations,
  fetchConversationById,
  appendMessage,
  removeConversation,
} from "../services/conversationService.js";

export const chat = async (req, res) => {
  try {
    const { message, currentBookTitle, currentChapterId, conversationId } = req.body;
    const userId = req.user?.userId;
 
    if (!message) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập câu hỏi." });
    }
 
    // Tìm / tạo conversation
    let conversation;
    if (conversationId) {
      conversation = await fetchConversationById(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ success: false, message: "Không tìm thấy cuộc trò chuyện." });
      }
    } else {
      conversation = await createConversation({
        userId,
        bookTitle: currentBookTitle,
        chapterId: currentChapterId,
        firstMessage: message,
      });
    }
 
    await appendMessage(conversation.id, "user", message);
 
    const updated = await fetchConversationById(conversation.id, userId);
    const history = updated.messages.map((m) => ({ role: m.role, content: m.content }));
 
    const userName = req.user?.full_name;
    const result = await chatWithAgent(message, currentBookTitle, currentChapterId, userName, history);
 
    if (!result.success) {
      return res.status(500).json({ success: false, message: result.message });
    }
 
    await appendMessage(conversation.id, "ai", result.reply);
 
    res.status(200).json({
      success: true,
      data: result.reply,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Lỗi Controller Chatbot:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống khi gọi Chatbot." });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const conversations = await fetchAllConversations(userId, req.query);
    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error("Lỗi lấy danh sách conversations:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const conversation = await fetchConversationById(req.params.id, userId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Không tìm thấy cuộc trò chuyện." });
    }
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error("Lỗi lấy conversation:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

export const createNewConversation = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { bookTitle, chapterId } = req.body;
    const conversation = await createConversation({ userId, bookTitle, chapterId });
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    console.error("Lỗi tạo conversation:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const deleted = await removeConversation(req.params.id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Không tìm thấy cuộc trò chuyện." });
    }
    res.status(200).json({ success: true, message: "Đã xóa cuộc trò chuyện." });
  } catch (error) {
    console.error("Lỗi xóa conversation:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
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
