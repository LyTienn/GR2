import UserModel from "../models/user-model.js";
import Subscription from "../models/subscription-model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt-utils.js";

class AuthService {
  static async register(body) {
    try {
      const { email, password, fullName } = body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return { statusCode: 409, data: { success: false, message: "Email already registered" } };
      }

      const newUser = await UserModel.create({ email, password, fullName });

      const accessToken = generateAccessToken(newUser.user_id, newUser.email, newUser.role);
      const refreshToken = generateRefreshToken(newUser.user_id);

      await UserModel.saveRefreshToken(newUser.user_id, refreshToken);

      return {
        statusCode: 201,
        data: {
          success: true,
          message: "User registered successfully",
          data: {
            user: {
              userId: newUser.user_id,
              email: newUser.email,
              fullName: newUser.full_name,
              role: newUser.role,
            }
          }
        },
        tokens: { accessToken, refreshToken }
      };
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return { statusCode: 409, data: { success: false, message: "Email already registered" } };
      }
      throw error;
    }
  }

  static async login(body) {
    try {
      const { email, password } = body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return { statusCode: 401, data: { success: false, message: "Invalid email or password" } };
      }

      const isPasswordValid = await UserModel.comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        return { statusCode: 401, data: { success: false, message: "Invalid email or password" } };
      }

      const accessToken = generateAccessToken(user.user_id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.user_id);

      await UserModel.saveRefreshToken(user.user_id, refreshToken);

      let packageDetails = null;
      if (user.tier === 'PREMIUM') {
        const activeSub = await Subscription.findOne({
          where: { user_id: user.user_id, status: 'ACTIVE' },
          order: [['expiry_date', 'DESC']],
          raw: true
        });

        if (activeSub) {
          packageDetails = activeSub.package_details;
        }
      }

      return {
        statusCode: 200,
        data: {
          success: true,
          message: "Login successful",
          data: {
            user: {
              userId: user.user_id,
              email: user.email,
              fullName: user.full_name,
              role: user.role,
              tier: user.tier,
              package_details: packageDetails,
            }
          }
        },
        tokens: { accessToken, refreshToken }
      };
    } catch (error) {
      throw error; 
    }
  }

  static async refreshToken(refreshTokenFromCookie) {
    if (!refreshTokenFromCookie) {
      return { statusCode: 401, data: { success: false, message: "Refresh token not found" } };
    }

    const decoded = verifyRefreshToken(refreshTokenFromCookie);
    if (!decoded) {
      return { statusCode: 401, data: { success: false, message: "Invalid refresh token" } };
    }

    const user = await UserModel.findByRefreshToken(refreshTokenFromCookie);
    if (!user || user.user_id !== decoded.userId) {
      return { statusCode: 401, data: { success: false, message: "Invalid refresh token" } };
    }

    const newAccessToken = generateAccessToken(user.user_id, user.email, user.role);

    return {
      statusCode: 200,
      data: { success: true, message: "Token refreshed successfully" },
      tokens: { accessToken: newAccessToken }
    };
  }

  static async logout(userId) {
    if (userId) {
      await UserModel.clearRefreshToken(userId);
    }
    return { statusCode: 200, data: { success: true, message: "Logout successful" } };
  }
}

export default AuthService;