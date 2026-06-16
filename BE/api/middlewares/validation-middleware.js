import { body, validationResult } from "express-validator";

// Error code mapping - dùng cho i18n
const errorCodeMap = {
  // Email validation
  "email_invalid": "INVALID_EMAIL",
  
  // Password validation
  "password_min": "PASSWORD_TOO_SHORT",
  "password_required": "PASSWORD_REQUIRED",
  
  // Full name validation
  "fullname_required": "FULL_NAME_REQUIRED",
  "fullname_length": "FULL_NAME_LENGTH_INVALID",
  
  // Token validation
  "token_required": "TOKEN_REQUIRED",
};

// Helper function để xử lý validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      errorCode: err.msg, // Giờ là error code thay vì message
    }));
    
    return res.status(400).json({
      success: false,
      statusCode: 400,
      data: {
        success: false,
        errorCode: formattedErrors[0]?.errorCode || "VALIDATION_ERROR",
        errors: formattedErrors,
      },
    });
  }
  next();
};

export const validateRegister = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("INVALID_EMAIL"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("PASSWORD_TOO_SHORT"),
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("FULL_NAME_REQUIRED")
    .isLength({ min: 2, max: 255 })
    .withMessage("FULL_NAME_LENGTH_INVALID"),
  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("INVALID_EMAIL"),
  body("password")
    .notEmpty()
    .withMessage("PASSWORD_REQUIRED"),
  handleValidationErrors,
];

export const validateForgotPassword = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("INVALID_EMAIL"),
  handleValidationErrors,
];

export const validateResetPassword = [
  body("token")
    .notEmpty()
    .withMessage("TOKEN_REQUIRED"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("PASSWORD_TOO_SHORT"),
  handleValidationErrors,
];
