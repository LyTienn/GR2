// import axiosInstance from '../config/Axios-config.jsx';
import HttpClient from "./HttpClient";

const AdminChapterService = {
    getChapterById: (id) => {
        return HttpClient.get(`/chapters/${id}`);
    },
    updateChapter: (id, data) => {
        return HttpClient.put(`/chapters/${id}`, data);
    },
    deleteChapter: (id) => {
        return HttpClient.delete(`/chapters/${id}`);
    },
    createChapter: (data) => {
        return HttpClient.post(`/chapters`, data);
    }
};

export default AdminChapterService;
