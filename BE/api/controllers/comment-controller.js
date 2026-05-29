import CommentService from "../services/commentService.js";

class CommentController {
  
  static async createComment(req, res) {
    try {
      const result = await CommentService.createComment(req.body, req.user.userId, req.params.bookId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Create comment error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async reactToComment(req, res) {
    try {
      const result = await CommentService.reactToComment(req.params.commentId, req.body.type, req.user.userId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("React to comment error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getBookComments(req, res) {
    try {
      const result = await CommentService.getBookComments(req.params.bookId, req.query, req.user?.userId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get book comments error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async updateComment(req, res) {
    try {
      const result = await CommentService.updateComment(req.params.commentId, req.body, req.user.userId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Update comment error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async deleteComment(req, res) {
    try {
      const result = await CommentService.deleteComment(req.params.commentId, req.user.userId, req.user.role);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Delete comment error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getAllComments(req, res) {
    try {
      const result = await CommentService.getAllComments(req.query);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get all comments error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getUserComments(req, res) {
    try {
      const result = await CommentService.getUserComments(req.user.userId, req.query);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get user comments error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getSentimentStats(req, res) {
    try {
      const result = await CommentService.getSentimentStats(req.query.bookId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get sentiment stats error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getBooksWithComments(req, res) {
    try {
      const result = await CommentService.getBooksWithComments(req.query.limit);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get books with comments error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

export default CommentController;