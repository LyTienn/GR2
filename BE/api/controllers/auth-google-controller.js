import { generateAccessToken, generateRefreshToken } from "../utils/jwt-utils.js";
import UserModel from "../models/user-model.js";

class AuthGoogleController {
  /**
   * Khởi động luồng OAuth2 với Google.
   * Passport tự động redirect sang màn hình đăng nhập Google.
   */
  static initiateGoogleLogin(req, res) {
    // Handled entirely by passport.authenticate("google") middleware in route
  }

  /**
   * Xử lý callback từ Google sau khi người dùng đăng nhập thành công.
   * Tạo JWT, set cookie, redirect về Frontend.
   */
  static async handleGoogleCallback(req, res) {
    try {
      const user = req.user; // được gắn bởi passport sau khi Strategy xử lý xong

      if (!user) {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
      }

      const accessToken = generateAccessToken(user.user_id, user.email, user.role);
      const refreshToken = generateRefreshToken(user.user_id);

      // Lưu refresh token vào DB (giống luồng đăng nhập thường)
      await UserModel.saveRefreshToken(user.user_id, refreshToken);

      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

      // Set HTTP-only cookie cho cả hai token (nhất quán với luồng thường)
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 60 * 60 * 1000, // 1 giờ
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });

      // Redirect về trang trung gian trên Frontend để cập nhật Redux store
      return res.redirect(`${clientUrl}/`);
    } catch (error) {
      console.error("Google callback error:", error);
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      return res.redirect(`${clientUrl}/login?error=server_error`);
    }
  }
}

export default AuthGoogleController;
