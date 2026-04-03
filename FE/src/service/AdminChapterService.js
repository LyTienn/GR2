import { firstValueFrom } from "rxjs";
import HttpClient from "./HttpClient";

const AdminChapterService = {
    getChapterById: async (id) => {
        return await firstValueFrom(HttpClient.get(`/chapters/${id}`));
    },
    updateChapter: async (id, data) => {
        return await firstValueFrom(HttpClient.put(`/chapters/${id}`, data));
    },
    deleteChapter: async (id) => {
        return await firstValueFrom(HttpClient.delete(`/chapters/${id}`));
    },
    createChapter: async (data) => {
        return await firstValueFrom(HttpClient.post(`/chapters`, data));
    }
};

export default AdminChapterService;
