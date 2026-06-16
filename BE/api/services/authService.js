import crypto from "crypto";
import UserModel from "../models/user-model.js";
import Subscription from "../models/subscription-model.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "./emailService.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt-utils.js";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_PASSWORD_TOKEN_TTL_MS = 15 * 60 * 1000;

const generateVerificationToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

class AuthService {
  static async register(body) {
    try {
      const { email, password, fullName } = body;

      const existingUser = await UserModel.findByEmail(email);

      if (existingUser) {
        if (existingUser.status === "ACTIVE") {
          return {
            statusCode: 409,
            data: { success: false, message: "Email đã được đăng ký" },
          };
        }

        // Tài khoản tồn tại nhưng chưa kích hoạt -> gửi lại email xác thực
        const token = generateVerificationToken();
        const expiredAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

        await UserModel.setVerificationToken(existingUser.user_id, token, expiredAt);
        await sendVerificationEmail(existingUser.email, existingUser.full_name, token);

        return {
          statusCode: 200,
          data: {
            success: true,
            message:
              "Email này đã được đăng ký nhưng chưa kích hoạt. Một email xác thực mới đã được gửi tới bạn.",
          },
        };
      }

      // Tạo user mới, trạng thái INACTIVE chờ xác thực email
      const token = generateVerificationToken();
      const expiredAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

      const newUser = await UserModel.create({
        email,
        password,
        fullName,
        status: "INACTIVE",
        verificationToken: token,
        verificationExpiredAt: expiredAt,
      });

      await sendVerificationEmail(newUser.email, newUser.full_name, token);

      return {
        statusCode: 201,
        data: {
          success: true,
          message:
            "Đăng ký thành công. Vui lòng kiểm tra email để xác thực và kích hoạt tài khoản.",
          data: {
            user: {
              userId: newUser.user_id,
              email: newUser.email,
              fullName: newUser.full_name,
              role: newUser.role,
              status: newUser.status,
            },
          },
        },
        // Không trả tokens vì tài khoản chưa kích hoạt -> chưa cho đăng nhập
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

      if (user.status !== "ACTIVE") {
        return {
          statusCode: 403,
          data: {
            success: false,
            message: "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác thực tài khoản.",
          },
        };
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

  static async forgotPassword(body) {
    try {
      const { email } = body;
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return {
          statusCode: 200,
          data: { success: true, message: "Nếu email tồn tại trong hệ thống, hãy kiểm tra email để đặt lại mật khẩu" }
        };
      }

      const rawToken = generateVerificationToken(); // Token gốc dạng plain text
      const hashedToken = hashToken(rawToken);       // Bản băm để lưu vào DB
      const expiredAt = new Date(Date.now() + RESET_PASSWORD_TOKEN_TTL_MS);

      await UserModel.setResetPasswordToken(user.user_id, hashedToken, expiredAt);
      await sendResetPasswordEmail(user.email, user.full_name, rawToken);

      return {
        statusCode: 200,
        data: { success: true, message: "Nếu email tồn tại trong hệ thống, hãy kiểm tra email để đặt lại mật khẩu" }
      };
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(body) {
    try {
      const { token, newPassword } = body;

      if (!token) {
        return { statusCode: 400, data: { success: false, errorCode: "TOKEN_REQUIRED" } };
      }

      const hashedToken = hashToken(token);
      let user = await UserModel.findByResetPasswordToken(hashedToken);
      if (!user) {
        user = await UserModel.findByResetPasswordToken(token);
      }

      if (!user) {
        return { statusCode: 400, data: { success: false, errorCode: "RESET_TOKEN_INVALID" } };
      }

      if (!user.reset_password_expired_at || new Date(user.reset_password_expired_at) < new Date()) {
        return { statusCode: 400, data: { success: false, errorCode: "RESET_TOKEN_EXPIRED" } };
      }

      await UserModel.updatePassword(user.user_id, newPassword);
      await UserModel.clearRefreshToken(user.user_id);
      await UserModel.clearResetPasswordToken(user.user_id);

      return { statusCode: 200, data: { success: true } };
    } catch (error) {
      throw error;
    }
  }
  // Xác thực email qua token gửi trong link
  static async verifyEmail(token) {
    if (!token) {
      return { statusCode: 400, data: { success: false, errorCode: "MISSING_TOKEN" } };
    }

    const user = await UserModel.findByVerificationToken(token);

    if (!user) {
      return {
        statusCode: 400,
        data: { success: false, errorCode: "INVALID_OR_USED_TOKEN" },
      };
    }

    if (user.status === "ACTIVE") {
      return {
        statusCode: 200,
        data: { success: true, errorCode: "ALREADY_ACTIVATED" },
      };
    }

    if (!user.verification_expired_at || new Date(user.verification_expired_at) < new Date()) {
      return {
        statusCode: 400,
        data: {
          success: false,
          errorCode: "VERIFICATION_LINK_EXPIRED"
        },
      };
    }

    await UserModel.activateUser(user.user_id);

    return {
      statusCode: 200,
      data: { success: true, errorCode: "VERIFICATION_SUCCESS" },
    };
  }
}

export default AuthService;