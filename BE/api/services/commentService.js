import Comment from "../models/comment-model.js";
import CommentReaction from "../models/comment-reaction-model.js";
import sequelize from "../config/db-config.js";
import Book from "../models/book-model.js";
import { User } from "../models/index.js";
import { Op } from "sequelize";
import { Transaction } from "sequelize";

class CommentService {
  static async createComment(body, userId, bookId) {
    const { content, rating } = body;

    if (!rating || rating < 1 || rating > 5) {
      return { statusCode: 400, data: { success: false, message: "Rating must be between 1 and 5" } };
    }

    const existingComment = await Comment.findOne({
      where: { user_id: userId, book_id: bookId },
    });

    if (existingComment) {
      if (existingComment.is_deleted == 0 || existingComment.is_deleted === false) {
        return { 
          statusCode: 409, 
          data: { success: false, code: "ALREADY_COMMENTED", message: "You have already commented on this book" } 
        };
      } else {
        await existingComment.update({
          content: content,
          rating: rating,
          status: 'APPROVED',
          is_deleted: 0 
        });
      }
    } else {
      await Comment.create({
        content, rating, user_id: userId, book_id: bookId, status: 'APPROVED',
      });
    }

    const finalComment = await Comment.findOne({
      where: { user_id: userId, book_id: bookId },
      include: [
        { model: User, as: "user", attributes: ["user_id", "full_name", "email"] },
      ],
    });

    return { 
      statusCode: 201, 
      data: { success: true, message: "Comment created successfully", data: finalComment } 
    };
  }

  static async reactToComment(commentId, type, userId) {
    const transaction = await sequelize.transaction();
    try {
      if (type !== 'LIKE') {
        await transaction.rollback();
        return { statusCode: 400, data: { success: false, message: "Invalid reaction type" } };
      }

      const comment = await Comment.findByPk(commentId);
      if (!comment) {
        await transaction.rollback();
        return { statusCode: 404, data: { success: false, message: "Comment not found" } };
      }

      const existingReaction = await CommentReaction.findOne({
        where: { user_id: userId, comment_id: commentId },
        transaction,
        lock: Transaction.LOCK.UPDATE
      });

      if (existingReaction) {
        if (existingReaction.type === type) {
          await existingReaction.destroy({ transaction });
          await transaction.commit();
          return { statusCode: 200, data: { success: true, message: "Reaction removed", action: "removed" } };
        } else {
          existingReaction.type = type;
          await existingReaction.save({ transaction });
          await transaction.commit();
          return { statusCode: 200, data: { success: true, message: "Reaction updated", action: "updated" } };
        }
      } else {
        await CommentReaction.create({
          user_id: userId,
          comment_id: commentId,
          type: type
        }, { transaction });
        await transaction.commit();
        return { statusCode: 201, data: { success: true, message: "Reaction added", action: "added" } };
      }
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getBookComments(bookId, query, userId) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const { count, rows } = await Comment.findAndCountAll({
      where: {
        book_id: bookId,
        is_deleted: 0,
        ...(query.sentiment ? { sentiment: query.sentiment } : {})
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "full_name"],
        },
      ],
      limit: limit,
      offset: offset,
      order: [["created_at", "DESC"]],
    });

    const allComments = await Comment.findAll({
      where: { book_id: bookId, is_deleted: 0 },
      attributes: ["rating"],
    });

    const averageRating = allComments.length > 0
        ? allComments.reduce((sum, c) => sum + c.rating, 0) / allComments.length
        : 0;
    
    const commentIds = rows.map(c => c.comment_id);

    let reactions = [];
    if (commentIds.length > 0) {
      reactions = await CommentReaction.findAll({
        where: { comment_id: commentIds, type: 'LIKE' }
      });
    }

    const commentsWithReactions = rows.map(comment => {
      const commentReactions = reactions.filter(r => r.comment_id === comment.comment_id);
      const likeCount = commentReactions.length;
      let userReaction = null;
      
      if (userId) {
         const userAction = commentReactions.find(r => r.user_id === userId);
         if (userAction) userReaction = 'LIKE';
      }

      return {
         ...comment.toJSON(),
         likeCount,
         userReaction
      };
    });

    return {
      statusCode: 200,
      data: {
        success: true,
        data: {
          comments: commentsWithReactions,
          pagination: {
            total: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit),
          },
          averageRating: averageRating.toFixed(1),
          totalComments: allComments.length,
        },
      }
    };
  }

  static async updateComment(commentId, body, userId) {
    const { content, rating } = body;

    const comment = await Comment.findOne({ where: { comment_id: commentId, is_deleted: 0 } });

    if (!comment) return { statusCode: 404, data: { success: false, message: "Comment not found" } };
    if (comment.user_id !== userId) return { statusCode: 403, data: { success: false, message: "You can only update your own comments" } };
    if (rating && (rating < 1 || rating > 5)) return { statusCode: 400, data: { success: false, message: "Rating must be between 1 and 5" } };

    if (content !== undefined) comment.content = content;
    if (rating !== undefined) comment.rating = rating;
    await comment.save();

    const updatedComment = await Comment.findByPk(commentId, {
      include: [{ model: User, as: "user", attributes: ["user_id", "full_name"] }],
    });

    return { statusCode: 200, data: { success: true, message: "Comment updated successfully", data: updatedComment } };
  }

  static async deleteComment(commentId, userId, userRole) {
    const comment = await Comment.findOne({ where: { comment_id: commentId, is_deleted: 0 } });

    if (!comment) return { statusCode: 404, data: { success: false, message: "Comment not found" } };
    if (comment.user_id !== userId && userRole !== "ADMIN") {
      return { statusCode: 403, data: { success: false, message: "You can only delete your own comments" } };
    }

    await Comment.update(
      { is_deleted: 1 }, 
      { where: { comment_id: commentId } }
    );

    return { statusCode: 200, data: { success: true, message: "Comment deleted successfully" } };
  }

  // #region ADMIN COMMENT
  static async getAllComments(query) {
    const page = Math.max(1, parseInt(query.page || 1, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || 50, 10) || 50));
    const offset = (page - 1) * limit;

    const where = { is_deleted: 0 };
    if (query.rating) where.rating = query.rating;
    if (query.bookId) where.book_id = query.bookId;
    if (query.userId) where.user_id = query.userId;
    if (query.sentiment) where.sentiment = query.sentiment;

    const { count, rows } = await Comment.findAndCountAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["user_id", "full_name", "email"] },
        { model: Book, as: "book", attributes: ["id", "title"] },
      ],
      limit: limit,
      offset: offset,
      order: [["created_at", "DESC"]],
    });

    return {
      statusCode: 200,
      data: {
        success: true,
        data: {
          comments: rows,
          pagination: { total: count, page: page, limit: limit, totalPages: Math.ceil(count / limit) },
        },
      }
    };
  }

  static async getUserComments(userId, query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const { count, rows } = await Comment.findAndCountAll({
      where: { user_id: userId, is_deleted: 0 },
      include: [{ model: Book, as: "book", attributes: ["id", "title"] }],
      limit: limit,
      offset: offset,
      order: [["created_at", "DESC"]],
    });

    return {
      statusCode: 200,
      data: {
        success: true,
        data: {
          comments: rows,
          pagination: { total: count, page: page, limit: limit, totalPages: Math.ceil(count / limit) },
        },
      }
    };
  }

  static async getSentimentStats(queryBookId) {
    const where = { is_deleted: 0 };
    if (queryBookId) where.book_id = queryBookId;

    const stats = await Comment.findAll({
      where,
      attributes: [
        'sentiment',
        [Comment.sequelize.fn('COUNT', Comment.sequelize.col('sentiment')), 'count']
      ],
      group: ['sentiment']
    });

    const formattedStats = {
      POSITIVE: 0,
      NEUTRAL: 0,
      NEGATIVE: 0,
      UNKNOWN: 0
    };

    stats.forEach(s => {
      const sentiment = s.get('sentiment');
      const count = parseInt(s.get('count'));
      if (sentiment && formattedStats[sentiment] !== undefined) {
        formattedStats[sentiment] = count;
      } else {
        formattedStats.UNKNOWN += count;
      }
    });

    return { statusCode: 200, data: { success: true, data: formattedStats } };
  }

  static async getBooksWithComments(queryLimit, querySearch, queryPage) {
    const page = Math.max(1, parseInt(queryPage, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryLimit, 10) || 30));
    const offset = (page - 1) * limit;

    const where = {};
    if (querySearch) {
      where.title = { [Op.iLike]: `%${querySearch}%` };
    }

    const totalCount = await Book.count({ where });

    const books = await Book.findAll({
      where,
      attributes: [
        'id',
        'title',
        ['image_url', 'cover_image'],
        [sequelize.fn('COUNT', sequelize.col('comments.comment_id')), 'commentCount']
      ],
      include: [{
        model: Comment,
        as: 'comments',
        attributes: [],
        where: { is_deleted: 0 },
        required: false 
      }],
      group: ['id', 'title', 'image_url'],
      limit: limit,
      offset: offset,
      order: [
        [sequelize.literal('"commentCount"'), 'DESC'],
        ['title', 'ASC']
      ],
      subQuery: false
    });

    return { 
      statusCode: 200, 
      data: { 
        success: true, 
        data: {
          books,
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      } 
    };
  }
}

export default CommentService;