import express from "express";
import passport from "../config/passport-config.js";
import AuthGoogleController from "../controllers/auth-google-controller.js";
import AuthController from "../controllers/auth-controller.js";
import {
  validateRegister,
  validateLogin,
} from "../middlewares/validation-middleware.js";
import { optionalAuth } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/register", validateRegister, AuthController.register);
router.post("/login", validateLogin, AuthController.login);
router.post("/refresh", AuthController.refreshToken);
router.post("/logout", optionalAuth, AuthController.logout);

// * Bước 1: Frontend redirect window.location.href đến đây.
// * Passport tự mở màn hình đăng nhập Google với scope profile + email.
router.get(
  "/google", passport.authenticate("google", { scope: ["profile", "email"], session: false, })
);

/**
 * Bước 2: Google gọi về URL này sau khi user cho phép.
 * Nếu thất bại → redirect về /login?error=...
 * Nếu thành công → passport gọi Strategy callback → gắn req.user
 *               → AuthGoogleController.handleGoogleCallback set cookie & redirect.
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=google_auth_failed`,
  }),
  AuthGoogleController.handleGoogleCallback
);

export default router;
