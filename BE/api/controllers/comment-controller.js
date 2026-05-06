import Comment from "../models/comment-model.js";
import CommentReaction from "../models/comment-reaction-model.js";
import sequelize from "../config/db-config.js";
import Book from "../models/book-model.js";
import { User } from "../models/index.js";
import { Op } from "sequelize";
// import SystemSettings from "../models/system-settings-model.js";
// import { checkSpam } from "../services/comment-ai-service.js";
import { Transaction } from "sequelize";

class CommentController {
  // Tạo comment mới
  static async createComment(req, res) {
    try {
      const { content, rating } = req.body;
      const userId = req.user.userId;
      const { bookId } = req.params;

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      // Kiểm tra xem user đã comment cho sách này chưa
      const existingComment = await Comment.findOne({
        where: {
          user_id: userId,
          book_id: bookId,
        },
      });

      if (existingComment) {
        return res.status(409).json({
          success: false,
          message: "You have already commented on this book",
        });
      }

      // Tạo comment mới
      const comment = await Comment.create({
        content,
        rating,
        user_id: userId,
        book_id: bookId,
        status: 'APPROVED',
        // sentiment: sentiment
      });

      // Lấy comment với thông tin user
      const commentWithUser = await Comment.findByPk(comment.comment_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["user_id", "full_name", "email"],
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        data: commentWithUser,
      });

    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  static async reactToComment(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { commentId } = req.params;
      const { type } = req.body;
      const userId = req.user.userId;

      if (type !== 'LIKE') {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: "Invalid reaction type" });
      }

      const comment = await Comment.findByPk(commentId);
      if (!comment) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: "Comment not found" });
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
          return res.status(200).json({ success: true, message: "Reaction removed", action: "removed" });
        } else {
          existingReaction.type = type;
          await existingReaction.save({ transaction });
          await transaction.commit();
          return res.status(200).json({ success: true, message: "Reaction updated", action: "updated" });
        }
      } else {
        await CommentReaction.create({
          user_id: userId,
          comment_id: commentId,
          type: type
        }, { transaction });
        await transaction.commit();
        return res.status(201).json({ success: true, message: "Reaction added", action: "added" });
      }
    } catch (error) {
      await transaction.rollback();
      console.error("React to comment error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Lấy tất cả comments của một sách
  static async getBookComments(req, res) {
    try {
      const { bookId } = req.params;
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;
      const userId = req.user?.userId;

      const { count, rows } = await Comment.findAndCountAll({
        where: {
          book_id: bookId,
          is_deleted: 0,
          ...(req.query.sentiment ? { sentiment: req.query.sentiment } : {})
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

      // Tính average rating
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

      // Map số lượng Like/Dislike vào từng comment
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

      res.status(200).json({
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
      });
    } catch (error) {
      console.error("Get book comments error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  // Cập nhật comment
  static async updateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content, rating } = req.body;
      const userId = req.user.userId;

      const comment = await Comment.findOne({ where: { comment_id: commentId, is_deleted: 0 } });

      if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
      if (comment.user_id !== userId) return res.status(403).json({ success: false, message: "You can only update your own comments" });
      if (rating && (rating < 1 || rating > 5)) return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });

      if (content !== undefined) comment.content = content;
      if (rating !== undefined) comment.rating = rating;
      await comment.save();

      const updatedComment = await Comment.findByPk(commentId, {
        include: [{ model: User, as: "user", attributes: ["user_id", "full_name"] }],
      });

      res.status(200).json({ success: true, message: "Comment updated successfully", data: updatedComment });
    } catch (error) {
      console.error("Update comment error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Xóa comment
  static async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;

      const comment = await Comment.findOne({ where: { comment_id: commentId, is_deleted: 0 } });

      if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
      if (comment.user_id !== userId && userRole !== "ADMIN") {
        return res.status(403).json({ success: false, message: "You can only delete your own comments" });
      }

      // Soft delete: is_deleted = 1
      comment.is_deleted = 1;
      await comment.save();

      res.status(200).json({ success: true, message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Admin: Lấy tất cả comments (có phân trang, filter)
  static async getAllComments(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const where = { is_deleted: 0 };
      if (req.query.rating) where.rating = req.query.rating;
      if (req.query.bookId) where.book_id = req.query.bookId;
      if (req.query.userId) where.user_id = req.query.userId;
      if (req.query.sentiment) where.sentiment = req.query.sentiment;

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

      res.status(200).json({
        success: true,
        data: {
          comments: rows,
          pagination: { total: count, page: page, limit: limit, totalPages: Math.ceil(count / limit) },
        },
      });
    } catch (error) {
      console.error("Get all comments error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Lấy comments của user
  static async getUserComments(req, res) {
    try {
      const userId = req.user.userId;
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const { count, rows } = await Comment.findAndCountAll({
        where: { user_id: userId, is_deleted: 0 },
        include: [{ model: Book, as: "book", attributes: ["id", "title"] }],
        limit: limit,
        offset: offset,
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: {
          comments: rows,
          pagination: { total: count, page: page, limit: limit, totalPages: Math.ceil(count / limit) },
        },
      });
    } catch (error) {
      console.error("Get user comments error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // // Duyệt comment (Admin)
  // static async approveComment(req, res) {
  //   try {
  //     const { commentId } = req.params;
  //     const comment = await Comment.findByPk(commentId);

  //     if (!comment) {
  //       return res.status(404).json({ success: false, message: "Comment not found" });
  //     }

  //     comment.status = "APPROVED";
  //     await comment.save();

  //     res.json({ success: true, message: "Comment approved", data: comment });
  //   } catch (error) {
  //     console.error("Approve comment error:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // }

  // // Từ chối comment (Admin)
  // static async rejectComment(req, res) {
  //   try {
  //     const { commentId } = req.params;
  //     const comment = await Comment.findByPk(commentId);

  //     if (!comment) {
  //       return res.status(404).json({ success: false, message: "Comment not found" });
  //     }

  //     comment.status = "REJECTED";
  //     await comment.save();

  //     res.json({ success: true, message: "Comment rejected", data: comment });
  //   } catch (error) {
  //     console.error("Reject comment error:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // }
  // // Change Status (Approve/Reject/Pending)
  // static async changeCommentStatus(req, res) {
  //   try {
  //     const { commentId } = req.params;
  //     const { status } = req.body;

  //     if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
  //       return res.status(400).json({ success: false, message: "Invalid or missing status" });
  //     }

  //     const comment = await Comment.findByPk(commentId);

  //     if (!comment) {
  //       return res.status(404).json({ success: false, message: "Comment not found" });
  //     }

  //     comment.status = status;
  //     await comment.save();

  //     res.json({ success: true, message: `Comment status changed to ${status}`, data: comment });
  //   } catch (error) {
  //     console.error("Change status error:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // }

  // // Bulk AI Check
  // static async bulkCheckPendingComments(req, res) {
  //   try {
  //     const pendingComments = await Comment.findAll({ where: { status: 'PENDING', is_deleted: 0 } });

  //     if (pendingComments.length === 0) {
  //       return res.json({ success: true, message: "No pending comments to check", data: { processed: 0 } });
  //     }

  //     let processedCount = 0;
  //     let spamCount = 0;

  //     // Limit concurrency using simple loop or map with limit if needed. For now simple parallel.
  //     // Process in batches of 3 to avoid rate limits
  //     const BATCH_SIZE = 3;
  //     for (let i = 0; i < pendingComments.length; i += BATCH_SIZE) {
  //       const batch = pendingComments.slice(i, i + BATCH_SIZE);
  //       const batchPromises = batch.map(async (comment) => {
  //         try {
  //           const analysis = await checkSpam(comment.content, comment.rating);
  //           console.log(`[BulkCheck] Comment ${comment.comment_id}: IsSpam=${analysis.isSpam}, Reason=${analysis.reason}`);

  //           if (analysis.isSpam) {
  //             comment.status = 'REJECTED';
  //             spamCount++;
  //           } else {
  //             comment.status = 'APPROVED';
  //           }
  //           if (analysis.sentiment) comment.sentiment = analysis.sentiment;
  //           await comment.save();
  //           processedCount++;
  //         } catch (err) {
  //           console.error(`[BulkCheck] Error processing comment ${comment.comment_id}:`, err);
  //           // Continue processing others even if one fails
  //         }
  //       });
  //       await Promise.all(batchPromises);
  //     }

  //     res.json({ success: true, message: "Bulk check completed", data: { processed: processedCount, spamDetected: spamCount } });

  //   } catch (error) {
  //     console.error("Bulk check error:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // }

  // // Get Moderation Mode
  // static async getModerationMode(req, res) {
  //   try {
  //     const setting = await SystemSettings.findOne({ where: { key: 'MODERATION_MODE' } });
  //     res.json({ success: true, mode: setting ? setting.value : 'DEFAULT' });
  //   } catch (error) {
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // }

  // // Update Moderation Mode
  // static async updateModerationMode(req, res) {
  //   try {
  //     console.log("DEBUG: updateModerationMode called");
  //     console.log("DEBUG Body:", req.body);
  //     const { mode } = req.body; // DEFAULT or AI_AUTO
  //     if (!['DEFAULT', 'AI_AUTO', 'AUTO_APPROVE'].includes(mode)) {
  //       return res.status(400).json({ success: false, message: "Invalid mode" });
  //     }

  //     console.log("DEBUG: Finding setting...");
  //     let setting = await SystemSettings.findOne({ where: { key: 'MODERATION_MODE' } });
  //     console.log("DEBUG: Setting found:", setting ? "YES" : "NO");
  //     if (setting) {
  //       setting.value = mode;
  //       await setting.save();
  //     } else {
  //       await SystemSettings.create({ key: 'MODERATION_MODE', value: mode });
  //     }

  //     res.json({ success: true, message: "Mode updated", mode });
  //   } catch (error) {
  //     console.error("DEBUG: Update mode error:", error);
  //     res.status(500).json({ success: false, message: "Server error", error: error.message });
  //   }
  // }

  // // Bulk Approve All Pending
  // static async bulkApprove(req, res) {
  //   try {
  //     const [updatedCount] = await Comment.update(
  //       { status: 'APPROVED' },
  //       { where: { status: 'PENDING', is_deleted: 0 } }
  //     );
  //     res.json({ success: true, message: "All pending comments approved", data: { processed: updatedCount } });
  //   } catch (error) {
  //     console.error("Bulk approve error:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // }

  // // Bulk Reject All Pending
  // static async bulkReject(req, res) {
  //   try {
  //     const [updatedCount] = await Comment.update(
  //       { status: 'REJECTED' },
  //       { where: { status: 'PENDING', is_deleted: 0 } }
  //     );
  //     res.json({ success: true, message: "All pending comments rejected", data: { processed: updatedCount } });
  //   } catch (error) {
  //     console.error("Bulk reject error:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // }

  // Get Sentiment Stats
  static async getSentimentStats(req, res) {
    try {
      const { bookId } = req.query;
      const where = { is_deleted: 0 };
      if (bookId) where.book_id = bookId;

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

      res.json({ success: true, data: formattedStats });

    } catch (error) {
      console.error("Get sentiment stats error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // // Bulk Classify Sentiment (for comments with null sentiment)
  // static async bulkClassifySentiment(req, res) {
  //   try {
  //     // Find all comments where sentiment is NULL (and not deleted)
  //     const unclassifiedComments = await Comment.findAll({
  //       where: { is_deleted: 0, sentiment: null }
  //     });

  //     if (unclassifiedComments.length === 0) {
  //       return res.json({ success: true, message: "No unclassified comments found", data: { processed: 0 } });
  //     }

  //     let processedCount = 0;
  //     const BATCH_SIZE = 3;

  //     for (let i = 0; i < unclassifiedComments.length; i += BATCH_SIZE) {
  //       const batch = unclassifiedComments.slice(i, i + BATCH_SIZE);
  //       const batchPromises = batch.map(async (comment) => {
  //         try {
  //           // Re-use checkSpam service which returns sentiment
  //           const analysis = await checkSpam(comment.content, comment.rating);
  //           if (analysis.sentiment) {
  //             comment.sentiment = analysis.sentiment;
  //             await comment.save();
  //             processedCount++;
  //           }
  //         } catch (err) {
  //           console.error(`[BulkClassify] Error processing comment ${comment.comment_id}:`, err);
  //         }
  //       });
  //       await Promise.all(batchPromises);
  //     }

  //     res.json({ success: true, message: "Bulk classification completed", data: { processed: processedCount } });

  //   } catch (error) {
  //     console.error("Bulk classify error:", error);
  //     res.status(500).json({ success: false, message: "Server error" });
  //   }
  // }

  // Get Books that have comments (for Admin Analytics)
  static async getBooksWithComments(req, res) {
    try {
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 100));

      const books = await Book.findAll({
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
          required: true 
        }],
        group: ['id', 'title', 'image_url'],
        limit: limit,
        order: [[sequelize.literal('"commentCount"'), 'DESC']],
        subQuery: false
      });

      res.json({ success: true, data: books });

    } catch (error) {
      console.error("Get books with comments error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

export default CommentController;