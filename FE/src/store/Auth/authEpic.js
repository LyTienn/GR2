import { ofType, combineEpics } from "redux-observable";
import { switchMap, map, catchError } from "rxjs";
import { of } from "rxjs";
import HttpClient from "@/service/HttpClient";
import { tap } from 'rxjs/operators';
import { 
    loginStart, loginSuccess, loginFailure,
    logoutStart, logoutSuccess, logoutFailure,
    registerStart, registerSuccess, registerFailure,
    fetchProfileStart, fetchProfileSuccess, fetchProfileFailure
} from './authSlice';

export const loginEpic = action$ => action$.pipe(
    ofType(loginStart.type),
    switchMap((action) =>
        HttpClient.post('/auth/login', action.payload).pipe(
            map(res => loginSuccess(res.data?.user || res.data)),
            catchError(error => of(loginFailure(error.response?.message || "Đăng nhập thất bại")))
        )
    )
);

export const logoutEpic = (action$) => action$.pipe(
    ofType(logoutStart.type),
    switchMap(() =>
        HttpClient.post('/auth/logout').pipe(
            map(() => logoutSuccess()),
            catchError(error => of(logoutFailure(error.response?.message || "Đăng xuất thất bại")))
        )
    )
);

export const registerEpic = (action$) => action$.pipe(
    ofType(registerStart.type),
    switchMap((action) => {
        // Tách riêng dữ liệu gửi lên API và các hàm callback điều hướng
        const { userData, onSuccess, onError } = action.payload;

        return HttpClient.post('/auth/register', userData).pipe(
            // Nếu API gọi thành công (200/201), tap sẽ chạy trước khi kết thúc
            tap(() => {
                if (onSuccess) onSuccess(); 
            }),
            map(() => registerSuccess()),
            catchError(error => {
                const errorMsg = error.response?.data?.message || error.response?.message || "Đăng ký thất bại";
                if (onError) onError(errorMsg);
                return of(registerFailure(errorMsg));
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

// export const fetchSubcriptionEpic = (action$) => action$.pipe(
//     ofType(fetchSubcriptionStart.type),
//     switchMap(() =>
//         HttpClient.get('/payment/subscription/current').pipe(
//             map(res => fetchSubcriptionSuccess(res.data.data)),
//             catchError(error => of(fetchSubcriptionFailure(error.response?.message || "Lấy thông tin hội viên thất bại")))
//         ))
// );

const authEpic = [loginEpic, logoutEpic, registerEpic, fetchProfileEpic];

export default authEpic;