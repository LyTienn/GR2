import UserModel, { User } from "../models/user-model.js";
import Subscription from "../models/subscription-model.js";

class UserService {
  // --- LUỒNG CURRENT USER (SELF-SERVICE) ---
  
  static async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password_hash", "refresh_token"] },
      raw: true
    });

    if (!user) return { statusCode: 404, data: { success: false, message: "User not found" } };

    let packageDetails = null;
    if (user.tier === 'PREMIUM') {
      const activeSub = await Subscription.findOne({
        where: { user_id: userId, status: 'ACTIVE' },
        order: [['expiry_date', 'DESC']],
        raw: true
      });
      if (activeSub) packageDetails = activeSub.package_details;
    }

    user.package_details = packageDetails;
    return { statusCode: 200, data: { success: true, data: user } };
  }

  static async updateProfile(userId, body) {
    const { fullName, email } = body;
    
    if (!fullName && !email) {
      return { statusCode: 400, data: { success: false, message: "At least one field (fullName or email) is required" } };
    }

    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.user_id !== userId) {
        return { statusCode: 409, data: { success: false, message: "Email already in use" } };
      }
    }

    const updatedUser = await UserModel.update(userId, { fullName, email });
    if (!updatedUser) {
      return { statusCode: 404, data: { success: false, message: "User not found" } };
    }

    return { statusCode: 200, data: { success: true, message: "Profile updated successfully", data: { user: updatedUser } } };
  }

  static async changePassword(userId, body) {
    const { currentPassword, newPassword } = body;
    
    if (!currentPassword || !newPassword) {
      return { statusCode: 400, data: { success: false, message: "Current password and new password are required" } };
    }
    if (newPassword.length < 6) {
      return { statusCode: 400, data: { success: false, message: "New password must be at least 6 characters long" } };
    }

    const userEmailObj = await UserModel.findById(userId);
    const user = await UserModel.findByEmail(userEmailObj.email);
    if (!user) return { statusCode: 404, data: { success: false, message: "User not found" } };

    const isPasswordValid = await UserModel.comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) return { statusCode: 401, data: { success: false, message: "Current password is incorrect" } };

    const success = await UserModel.updatePassword(userId, newPassword);
    if (!success) return { statusCode: 500, data: { success: false, message: "Failed to update password" } };

    return { statusCode: 200, data: { success: true, message: "Password changed successfully" } };
  }

  static async deleteAccount(userId, body) {
    const { password } = body;
    
    if (!password) {
      return { statusCode: 400, data: { success: false, message: "Password is required to delete account" } };
    }

    const userEmailObj = await UserModel.findById(userId);
    const user = await UserModel.findByEmail(userEmailObj.email);
    
    const isPasswordValid = await UserModel.comparePassword(password, user.password_hash);
    if (!isPasswordValid) return { statusCode: 401, data: { success: false, message: "Incorrect password" } };

    const deleted = await UserModel.delete(userId);
    if (!deleted) return { statusCode: 404, data: { success: false, message: "User not found" } };

    return { statusCode: 200, data: { success: true, message: "Account deleted successfully" } };
  }

  // --- LUỒNG QUẢN TRỊ VIÊN (ADMIN) ---

  static async getAllUsers(query) {
    const { page = 1, limit = 10, role, tier, q } = query;
    const result = await UserModel.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      tier,
      q
    });
    return { statusCode: 200, data: { success: true, data: result } };
  }

  static async getUserById(userId) {
    const user = await UserModel.findById(userId);
    if (!user) return { statusCode: 404, data: { success: false, message: "User not found" } };
    
    return { statusCode: 200, data: { success: true, data: { user } } };
  }

  static async searchUsers(query) {
    const { q } = query;
    if (!q || q.trim().length < 2) return { statusCode: 400, data: { success: false, message: "Search query must be at least 2 characters" } };

    const users = await UserModel.search(q.trim());
    return { statusCode: 200, data: { success: true, data: { users } } };
  }

  static async deleteUser(adminId, userId) {
    if (userId === adminId) {
      return { statusCode: 403, data: { success: false, message: "You cannot delete your own account" } };
    }
    
    const deleted = await UserModel.delete(userId);
    if (!deleted) return { statusCode: 404, data: { success: false, message: "User not found" } };
    
    return { statusCode: 200, data: { success: true, message: "User deleted successfully" } };
  }

  static async updateUser(adminId, userId, body) {
    const { role, tier, fullName, password } = body;

    if (userId === adminId && role && role !== "ADMIN") {
      return { statusCode: 403, data: { success: false, message: "You cannot demote your own account" } };
    }

    const user = await UserModel.findById(userId);
    if (!user) return { statusCode: 404, data: { success: false, message: "User not found" } };

    // Đã xóa bỏ dynamic import, sử dụng trực tiếp User từ đầu file
    const userInstance = await User.findByPk(userId);

    if (role && ["USER", "ADMIN"].includes(role)) userInstance.role = role;
    if (tier && ["FREE", "PREMIUM"].includes(tier)) userInstance.tier = tier;
    if (fullName) userInstance.full_name = fullName;

    if (password) {
      if (password.length < 6) {
        return { statusCode: 400, data: { success: false, message: "Password must be at least 6 characters" } };
      }
      await UserModel.updatePassword(userId, password);
    }

    await userInstance.save();

    return { statusCode: 200, data: { success: true, message: "User updated successfully", data: { user: userInstance.toJSON() } } };
  }

  static async createUser(body) {
    const { email, password, fullName, role, tier } = body;

    if (!email || !password) {
      return { statusCode: 400, data: { success: false, message: "Email and password are required" } };
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return { statusCode: 409, data: { success: false, message: "Email already exists" } };
    }

    const newUser = await UserModel.create({
      email,
      password,
      fullName,
      role: role || "USER",
      tier: tier || "FREE",
    });

    return { statusCode: 201, data: { success: true, message: "User created successfully", data: { user: newUser } } };
  }
}

export default UserService;