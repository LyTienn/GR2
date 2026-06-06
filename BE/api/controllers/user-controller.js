import UserService from "../services/userService.js";

class UserController {
  // --- LUỒNG CURRENT USER (SELF-SERVICE) ---

  static async getProfile(req, res) {
    try {
      const result = await UserService.getProfile(req.user.userId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getAccountType(req, res) {
    try {
      const result = await UserService.getAccountType(req.user.userId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get account type error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async updateProfile(req, res) {
    try {
      const result = await UserService.updateProfile(req.user.userId, req.body);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async changePassword(req, res) {
    try {
      const result = await UserService.changePassword(req.user.userId, req.body);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async deleteAccount(req, res) {
    try {
      const result = await UserService.deleteAccount(req.user.userId, req.body);
      if (result.statusCode === 200) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
      }
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // --- LUỒNG QUẢN TRỊ VIÊN (ADMIN) ---

  static async getAllUsers(req, res) {
    try {
      const result = await UserService.getAllUsers(req.query);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async getUserById(req, res) {
    try {
      const result = await UserService.getUserById(req.params.userId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Get user by ID error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async searchUsers(req, res) {
    try {
      const result = await UserService.searchUsers(req.query);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Search users error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async deleteUser(req, res) {
    try {
      const result = await UserService.deleteUser(req.user.userId, req.params.userId);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async updateUser(req, res) {
    try {
      const result = await UserService.updateUser(req.user.userId, req.params.userId, req.body);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async createUser(req, res) {
    try {
      const result = await UserService.createUser(req.body);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

export default UserController;