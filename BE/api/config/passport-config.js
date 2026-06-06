import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user-model.js";

const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const fullName = profile.displayName;

        if (!email) {
          return done(new Error("Không lấy được email từ tài khoản Google"), null);
        }

        // Tìm user theo google_id trước (nhanh hơn, không cần findOrCreate vì google_id là unique)
        const existingByGoogleId = await User.findOne({
          where: { google_id: googleId, is_deleted: 0 },
        });

        if (existingByGoogleId) {
          return done(null, existingByGoogleId);
        }

        // Tìm hoặc tạo user theo email — dùng findOrCreate để tránh race condition
        // khi 2 request OAuth đến cùng lúc cho cùng 1 user mới
        const [foundUser, created] = await User.findOrCreate({
          where: { email, is_deleted: 0 },
          defaults: {
            email,
            full_name: fullName,
            google_id: googleId,
            password_hash: "GOOGLE_OAUTH_NO_PASSWORD",
            role: "USER",
            tier: "FREE",
          },
        });

        // User đã tồn tại (đăng ký bằng email/password trước đó) nhưng chưa có google_id
        if (!created && !foundUser.google_id) {
          foundUser.google_id = googleId;
          await foundUser.save();
        }

        return done(null, foundUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;