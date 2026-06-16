import cron from "node-cron";
import UserModel from "../models/user-model.js";

export const startCleanupInactiveUsersJob = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const deletedCount = await UserModel.deleteExpiredInactiveUsers();
      if (deletedCount > 0) {
        console.log(`[Cleanup] Đã xóa ${deletedCount} tài khoản chưa kích hoạt và đã hết hạn xác thực.`);
      }
    } catch (error) {
      console.error("[Cleanup] Lỗi khi xóa tài khoản chưa kích hoạt:", error);
    }
  });

  console.log("[Cleanup] Cron job xóa tài khoản chưa kích hoạt đã được khởi động (chạy mỗi giờ).");
};