// import axiosInstance from '../config/Axios-config.jsx';
import HttpClient from "./HttpClient";

const AdminSubscriptionService = {
    getAllSubscriptions: async (params) => {
        const res = HttpClient.get('/subscriptions/admin/all', { params });
        return res; // axios interceptor already returns response.data
    },

    updateSubscription: async (id, data) => {
        return HttpClient.put(`/subscriptions/admin/${id}`, data);
    }
};

export default AdminSubscriptionService;
