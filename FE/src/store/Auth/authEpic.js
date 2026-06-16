import { ofType } from "redux-observable";
import { switchMap, map, catchError } from "rxjs";
import { of } from "rxjs";
import { toast } from "react-toastify";
import HttpClient from "@/service/HttpClient";
import i18n from "@/i18n";
import {
    loginStart, loginSuccess, loginFailure,
    logoutStart, logoutSuccess,
    registerStart, registerSuccess, registerFailure,
    forgotPasswordStart, forgotPasswordSuccess, forgotPasswordFailure,
    resetPasswordStart, resetPasswordSuccess, resetPasswordFailure,
    fetchProfileStart, fetchProfileSuccess, fetchProfileFailure
} from './authSlice';

const showLogoutSuccessToast = () => {
    toast.success(i18n.t("toasts.success.logoutSuccess"), {
        toastId: 'logout-success-toast'
    });
};

export const loginEpic = action$ => action$.pipe(
    ofType(loginStart.type),
    switchMap((action) =>
        HttpClient.post('/auth/login', action.payload, { skipToast: true }).pipe(
            map(res => loginSuccess(res.data?.user || res.data)),
            catchError(error => of(loginFailure(error.response?.message || "Đăng nhập thất bại")))
        )
    )
);

export const logoutEpic = (action$) => action$.pipe(
    ofType(logoutStart.type),
    switchMap(() =>
        HttpClient.post('/auth/logout').pipe(
            map(() => {
                showLogoutSuccessToast();
                return logoutSuccess();
            }),
            catchError(() => {
                // Logout luôn thành công về phía FE
                showLogoutSuccessToast();
                return of(logoutSuccess());
            })
        )
    )
);

export const registerEpic = (action$) => action$.pipe(
    ofType(registerStart.type),
    switchMap((action) => {
        const { userData, onSuccess, onError } = action.payload;

        return HttpClient.post('/auth/register', userData, { skipToast: true }).pipe(
            map(() => {
                if (onSuccess) onSuccess();
                return registerSuccess();
            }),
            catchError(error => {
                const response = error.response || {};
                const responseData = response.data || {};
                const errorCode = responseData.errorCode || response.errorCode;
                const errorMsg = responseData.message || response.message || "Registration failed";
                if (onError) {
                    onError({
                        message: errorMsg,
                        status: error.response?.status,
                        data: responseData,
                        errorCode,
                        errors: responseData.errors || [],
                    });
                }
                return of(registerFailure(errorMsg));
            })
        );
    })
);
export const forgotPasswordEpic = (action$) => action$.pipe(
    ofType(forgotPasswordStart.type),
    switchMap((action) => {
        const { email, onSuccess, onError } = action.payload;
        return HttpClient.post('/auth/forgot-password', { email }, { skipToast: true }).pipe(
            map((res) => {
                if (onSuccess) onSuccess(res.data?.message);
                return forgotPasswordSuccess();
            }),            
            catchError(error => {
                const msg = error.response?.message || "Yêu cầu thất bại.";
                if (onError) onError(msg);
                return of(forgotPasswordFailure(msg));
            })
        );
    })
);

export const resetPasswordEpic = (action$) => action$.pipe(
    ofType(resetPasswordStart.type),
    switchMap((action) => {
        const { token, newPassword, onSuccess, onError } = action.payload;
        return HttpClient.post('/auth/reset-password', { token, newPassword }, { skipToast: true }).pipe(
            map(() => {
                if (onSuccess) onSuccess();
                return resetPasswordSuccess();
            }),
            catchError(error => {
                const response = error.response || {};
                const responseData = response.data || {};
                const errorCode = responseData.errorCode || response.errorCode;
                const msg = responseData.message || response.message || "Reset password failed";
                if (onError) {
                    onError({
                        message: msg,
                        status: error.response?.status,
                        data: responseData,
                        errorCode,
                    });
                }
                return of(resetPasswordFailure(msg));
            })
        );
    })
);
export const fetchProfileEpic = (action$) => action$.pipe(
    ofType(fetchProfileStart.type),
    switchMap(() =>
        HttpClient.get('/users/profile').pipe(
            map(res => fetchProfileSuccess(res.data)),
            catchError(error => of(fetchProfileFailure(error.response?.message || "Lấy thông tin thất bại")))
        )
    )
);

const authEpic = [loginEpic, logoutEpic, registerEpic, fetchProfileEpic, forgotPasswordEpic, resetPasswordEpic];

export default authEpic;