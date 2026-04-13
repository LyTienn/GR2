import { firstValueFrom } from "rxjs";
import HttpClient from "./HttpClient";

const AdminSubscriptionService = {
    getAllSubscriptions: async (params) => {
        const res = await firstValueFrom(HttpClient.get('/subscriptions/admin/all', { search: params }));
        return res; 
    },

    updateSubscription: async (id, data) => {
        return await firstValueFrom(HttpClient.put(`/subscriptions/admin/${id}`, data));
    }
};

export default AdminSubscriptionService;
