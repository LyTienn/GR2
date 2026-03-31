import HttpClient from "./HttpClient";
import { firstValueFrom } from "rxjs";

const PaymentService = {
  // ✅ Lấy lịch sử giao dịch
  async getPaymentHistory() {
    try {
      const res = await firstValueFrom(
        HttpClient.get("/payment/history")
      );
      return res;
    } catch (error) {
      console.error("Lỗi getPaymentHistory:", error);
      throw error;
    }
  },

  // ✅ Kiểm tra subscription hiện tại
  async getCurrentSubscription() {
    try {
      const res = await firstValueFrom(
        HttpClient.get("/payment/subscription/current")
      );
      return res;
    } catch (error) {
      console.error("Lỗi getCurrentSubscription:", error);
      throw error;
    }
  },

  // ✅ Tạo thanh toán SePay
  async createSepayPayment(payload) {
    try {
      const res = await firstValueFrom(
        HttpClient.post("/payment/sepay/create", payload)
      );
      return res;
    } catch (error) {
      console.error("Lỗi createSepayPayment:", error);
      throw error;
    }
  },
};

export default PaymentService;