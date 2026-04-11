import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
        loginStart: (state) => { 
            state.isLoading = true;
            state.error = null; 
        },
        loginSuccess: (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        },
        loginFailure: (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.error = action.payload;
            state.user = null;
        },
        logoutStart: (state) => { state.isLoading = true; },
        logoutSuccess: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        },
        logoutFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.user = null;
            state.isAuthenticated = false;
        },
        registerStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        registerSuccess: (state) => {
            state.isLoading = false;
        },
        registerFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        fetchProfileStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        fetchProfileSuccess: (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        },
        fetchProfileFailure: (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
        }
    },
});

export const { clearAuthError, 
    loginStart, loginSuccess, loginFailure,
    logoutStart, logoutSuccess, logoutFailure,
    registerStart, registerSuccess, registerFailure,
    fetchProfileStart, fetchProfileSuccess, fetchProfileFailure
 } = AuthSlice.actions;
export default AuthSlice.reducer;