import HttpClient from './HttpClient.jsx';

const login = (credentials) => {
    return HttpClient.post('/auth/login', credentials);
};

const register = (userData) => {
    return HttpClient.post('/auth/register', userData);
};

const logout = () => {
    return HttpClient.post('/auth/logout');
};

const getProfile = () => {
    return HttpClient.get('/users/profile');
};

const updateProfile = (userData) => {
    return HttpClient.put('/users/profile', userData);
};

const changePassword = (passwordData) => {
    return HttpClient.post('/users/change-password', passwordData);
};

//USER XÓA
const deleteAccount = (password) => {
    return HttpClient.delete('/users/account', { body: { password } });
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