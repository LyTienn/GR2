import nodemailer from "nodemailer";

let transporter;

if (process.env.NODE_ENV === "test") {
  // Tạo transporter giả lập khi chạy kiểm thử (không kết nối internet)
  transporter = {
    verify: (callback) => callback(null, true),
    sendMail: async () => ({ messageId: "mock-email-id" }),
  };
} else {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ [Error] EMAIL_USER và EMAIL_PASS bắt buộc phải được cấu hình trong file .env.");
    process.exit(1);
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ [Error] Cấu hình Email transporter lỗi:", error.message);
    } else {
      console.log("✅ [Success] Email transporter đã sẵn sàng kết nối máy chủ SMTP");
    }
  });
}

/**
 * Gửi email xác thực tài khoản (HTML).
 * @param {string} to - Email người nhận
 * @param {string} fullName - Họ tên người nhận
 * @param {string} token - Token xác thực
 */

export const sendVerificationEmail = async (to, fullName, token) => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  const verifyUrl = `${backendUrl}/api/auth/verify-email?token=${token}`;

  const html = `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Xác thực tài khoản</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f5f7; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding: 40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <tr>
              <td style="background-color:#2563eb; padding: 24px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size: 22px;">Xác thực tài khoản</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 32px 16px 32px;">
                <p style="font-size:16px; color:#1f2937; margin:0 0 16px 0;">
                  Xin chào <strong>${fullName || "bạn"}</strong>,
                </p>
                <p style="font-size:15px; color:#4b5563; line-height:1.6; margin:0 0 24px 0;">
                  Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn nút bên dưới để kích hoạt tài khoản của bạn.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 24px 32px; text-align:center;">
                <a href="${verifyUrl}" target="_blank"
                   style="display:inline-block; background-color:#2563eb; color:#ffffff; text-decoration:none; font-size:15px; font-weight:bold; padding: 12px 32px; border-radius: 6px;">
                  Kích hoạt tài khoản
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 8px 32px;">
                <p style="font-size:13px; color:#9ca3af; line-height:1.6; margin:0;">
                  Nếu nút trên không hoạt động, vui lòng sao chép và dán liên kết sau vào trình duyệt:
                </p>
                <p style="font-size:13px; color:#2563eb; word-break:break-all; margin: 8px 0 0 0;">
                  ${verifyUrl}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px 32px 32px;">
                <p style="font-size:13px; color:#9ca3af; margin:0;">
                  Liên kết xác thực có hiệu lực trong vòng <strong>24 giờ</strong> kể từ thời điểm gửi.
                  Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f9fafb; padding: 16px 32px; text-align:center;">
                <p style="font-size:12px; color:#9ca3af; margin:0;">
                  © ${new Date().getFullYear()} Lybrary. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"Lybrary" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Xác thực tài khoản của bạn",
    html,
  });
};

/**
 * Gửi email đặt lại mật khẩu.
 * @param {string} to - Email người nhận
 * @param {string} fullName - Họ tên người nhận
 * @param {string} token - Token reset password
 */

export const sendResetPasswordEmail = async (to, fullName, token) => {
  const clientUrl = process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL_PROD
    : process.env.CLIENT_URL || "http://localhost:5173";
    
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const html = `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Đặt lại mật khẩu</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f5f7; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding: 40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <tr>
              <td style="background-color:#dc2626; padding: 24px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size: 22px;">Đặt lại mật khẩu</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 32px 16px 32px;">
                <p style="font-size:16px; color:#1f2937; margin:0 0 16px 0;">
                  Xin chào <strong>${fullName || "bạn"}</strong>,
                </p>
                <p style="font-size:15px; color:#4b5563; line-height:1.6; margin:0 0 24px 0;">
                  Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấn nút bên dưới để tiến hành đổi mật khẩu mới.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 24px 32px; text-align:center;">
                <a href="${resetUrl}" target="_blank"
                   style="display:inline-block; background-color:#dc2626; color:#ffffff; text-decoration:none; font-size:15px; font-weight:bold; padding: 12px 32px; border-radius: 6px;">
                  Đặt lại mật khẩu
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 8px 32px;">
                <p style="font-size:13px; color:#9ca3af; line-height:1.6; margin:0;">
                  Nếu nút trên không hoạt động, vui lòng sao chép và dán liên kết sau vào trình duyệt:
                </p>
                <p style="font-size:13px; color:#dc2626; word-break:break-all; margin: 8px 0 0 0;">
                  ${resetUrl}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 32px 32px 32px;">
                <p style="font-size:13px; color:#9ca3af; margin:0;">
                  Liên kết này có hiệu lực trong vòng <strong>15 phút</strong>.
                  Nếu bạn không yêu cầu thay đổi này, xin vui lòng bỏ qua email bảo mật này.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f9fafb; padding: 16px 32px; text-align:center;">
                <p style="font-size:12px; color:#9ca3af; margin:0;">
                  © ${new Date().getFullYear()} Lybrary. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"Lybrary" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Yêu cầu đặt lại mật khẩu của bạn",
    html,
  });
};