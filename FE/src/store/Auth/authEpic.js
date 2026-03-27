import { ofType, combineEpics } from "redux-observable";
import { switchMap, map, catchError } from "rxjs";
import { of } from "rxjs";
import HttpClient from "@/service/HttpClient";
import { 
    loginStart, loginSuccess, loginFailure,
    logoutStart, logoutSuccess, logoutFailure,
    registerStart, registerSuccess, registerFailure,
    fetchProfileStart, fetchProfileSuccess, fetchProfileFailure
} from './AuthSlice';

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
    switchMap((action) =>
        HttpClient.post('/auth/register', action.payload).pipe(
            map(() => registerSuccess()),
            catchError(error => of(registerFailure(error.response?.message || "Đăng ký thất bại")))
        )
    )
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

const authEpic = [loginEpic, logoutEpic, registerEpic, fetchProfileEpic];

export default authEpic;