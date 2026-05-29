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

  static async verifyEmail(req, res) {
    res.status(501).json({ success: false, message: "Email verification not implemented yet" });
  }

  static async forgotPassword(req, res) {
    res.status(501).json({ success: false, message: "Forgot password not implemented yet" });
  }

  static async resetPassword(req, res) {
    res.status(501).json({ success: false, message: "Reset password not implemented yet" });
  }
}

export default AuthController;