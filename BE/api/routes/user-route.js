import express from "express";
import UserController from "../controllers/user-controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth-middleware.js";
import { body } from "express-validator";

const router = express.Router();

router.get("/profile", authenticate, UserController.getProfile);

router.put(
  "/profile",
  authenticate,
  [
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("fullName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage("Full name must be between 2 and 255 characters"),
  ],
  UserController.updateProfile
);

router.post(
  "/change-password",
  authenticate,
  [
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  UserController.changePassword
);

router.post("/delete-account", authenticate, UserController.deleteAccount);

router.delete("/account", authenticate, UserController.deleteAccount);

router.get("/account-type", authenticate, UserController.getAccountType);

router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  UserController.getAllUsers
);

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  UserController.createUser
);

router.get(
  "/search",
  authenticate,
  authorizeRoles("ADMIN"),
  UserController.searchUsers
);

router.get(
  "/:userId",
  authenticate,
  authorizeRoles("ADMIN"),
  UserController.getUserById
);

router.put(
  "/:userId",
  authenticate,
  authorizeRoles("ADMIN"),
  UserController.updateUser
);

router.delete(
  "/:userId",
  authenticate,
  authorizeRoles("ADMIN"),
  UserController.deleteUser
);

export default router;