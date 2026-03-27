// import axiosInstance from "../config/Axios-config.jsx";
import HttpClient from "./HttpClient";

const PaymentService = {
  // Lấy lịch sử giao dịch
  async getPaymentHistory() {
    const res = HttpClient.get("/payment/history");
    return res;
  },

  async createSepayPayment(payload) {
    const res = HttpClient.post("/payment/sepay/create", payload);
    return res;
  },
};

export default PaymentService;
