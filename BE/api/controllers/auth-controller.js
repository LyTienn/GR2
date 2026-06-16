import AuthService from "../services/authService.js";

class AuthController {
  static setCookies(res, accessToken, refreshToken) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, 
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  static async register(req, res) {
    try {
      const result = await AuthService.register(req.body);
      if (result.statusCode === 201 && result.tokens) {
        AuthController.setCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
      }
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ success: false, message: "Server error during registration" });
    }
  }

  static async login(req, res) {
    try {
      const result = await AuthService.login(req.body);
      if (result.statusCode === 200 && result.tokens) {
        AuthController.setCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
      }
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Server error during login" });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;
      const result = await AuthService.refreshToken(refreshToken);

      if (result.statusCode === 200 && result.tokens) {
        res.cookie("accessToken", result.tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 1000, // Cập nhật thành 60 phút
        });
      }

      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  static async logout(req, res) {
    try {
      const userId = req.user?.userId;
      const result = await AuthService.logout(userId);

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * GET /auth/verify-email?token=xxxx
   * Người dùng bấm link trong email -> redirect về Frontend kèm trạng thái
   * để FE hiển thị thông báo và tự chuyển hướng về trang đăng nhập.
   */
  static async verifyEmail(req, res) {
    const clientUrl = process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL_PROD
    : process.env.CLIENT_URL_DEV || "http://localhost:5173";

    try {
      const { token } = req.query;
      const result = await AuthService.verifyEmail(token);

      if (result.statusCode === 200) {
        return res.redirect(`${clientUrl}/verify-email?status=success`);
      }

      const errorCode = result.data.errorCode || "VERIFICATION_FAILED";
      return res.redirect(`${clientUrl}/verify-email?status=failed&errorCode=${errorCode}`);    } catch (error) {
      console.error("Verify email error:", error);
      return res.redirect(`${clientUrl}/verify-email?status=failed`);
    }
  }

  static async forgotPassword(req, res) {
    try {
      const result = await AuthService.forgotPassword(req.body);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ success: false, message: "Server error during forgot password process" });
    }
  }

  static async resetPassword(req, res) {
    try {
      const result = await AuthService.resetPassword(req.body);
      return res.status(result.statusCode).json(result.data);
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ success: false, message: "Server error during reset password process" });
    }
  }
}

export default AuthController;