import Conversation from "../models/conversation-model.js";
import ConversationMessage from "../models/conversation_message-model.js";

export const createConversation = async ({ userId, bookTitle, chapterId, firstMessage }) => {
  const title = firstMessage?.slice(0, 50) || "Cuộc trò chuyện mới";
  return await Conversation.create({
    user_id: userId,
    book_title: bookTitle,
    chapter_id: chapterId,
    title,
  });
};

export const fetchAllConversations = async (userId, queryParams = {}) => {
  const pageNum = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const { count, rows } = await Conversation.findAndCountAll({
    where: { user_id: userId, is_deleted: 0 },
    attributes: ["id", "title", "book_title", "chapter_id", "created_at", "updated_at"],
    order: [["updated_at", "DESC"]],
    limit: limitNum,
    offset: offset
  });

  return {
    total: count,
    totalPages: Math.ceil(count / limitNum),
    currentPage: pageNum,
    conversations: rows
  };
};

export const fetchConversationById = async (id, userId) => {
  return await Conversation.findOne({
    where: { id, user_id: userId, is_deleted: 0 },
    include: [
      {
        model: ConversationMessage,
        as: "messages",
        attributes: ["id", "role", "content", "created_at"],
      },
    ],
    order: [[{ model: ConversationMessage, as: "messages" }, "created_at", "ASC"]],
  });
};

export const appendMessage = async (conversationId, role, content) => {
  const message = await ConversationMessage.create({
    conversation_id: conversationId,
    role,
    content,
  });

  await Conversation.update(
    { updated_at: new Date() },
    { where: { id: conversationId } }
  );

  return message;
};

export const removeConversation = async (id, userId) => {
  const conversation = await Conversation.findOne({
    where: { id, user_id: userId, is_deleted: 0 },
  });
  if (!conversation) return false;

  conversation.is_deleted = 1;
  await conversation.save();
  return true;
};