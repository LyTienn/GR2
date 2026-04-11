import HttpClient from './HttpClient.jsx';
import { firstValueFrom } from 'rxjs';

const login = (credentials) => {
    return HttpClient.post('/auth/login', credentials);
};

const register = (userData) => {
    return HttpClient.post('/auth/register', userData);
};

const logout = () => {
    return HttpClient.post('/auth/logout');
};

const getProfile = async () => {
    return await firstValueFrom(HttpClient.get('/users/profile'));
};

const updateProfile = async (userData) => {
    return await firstValueFrom(HttpClient.put('/users/profile', userData));
};

const changePassword = async (passwordData) => {
    return await firstValueFrom(HttpClient.post('/users/change-password', passwordData));
};

//USER XÓA
const deleteAccount = async (password) => {
    return await firstValueFrom(HttpClient.delete('/users/account', { body: { password } }));
};

const AuthService = {
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount
};

export default AuthService;