import { ajax } from 'rxjs/ajax';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { throwError, BehaviorSubject, defer, of } from 'rxjs';
import { toast } from 'react-toastify';
import { buildRequestUrl, extractHeaders, removeCustomKeys } from './HttpHelper';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject(null); 

const logoutAndRedirect = () => {
  toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
  window.location.href = '/login';
  return throwError(() => new Error('Session Expired'));
};

const handle401Error = (requestObj) => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null); 

    // Gọi API refresh token (trình duyệt tự mang Cookie chứa refreshToken đi)
    return ajax({
      url: `${BASE_URL}/auth/refresh-token`,
      method: 'POST',
      withCredentials: true 
    }).pipe(
      switchMap(() => {
        isRefreshing = false;
        refreshTokenSubject.next(true);

        // Gọi lại request ban đầu (tự động mang Cookie mới)
        return ajax(requestObj).pipe(switchMap(r => of(r.response)));
      }),
      catchError(() => {
        isRefreshing = false;
        return logoutAndRedirect();
      })
    );
  } else {
    // Đang refresh dở, các request lỗi 401 khác xếp hàng chờ
    return refreshTokenSubject.pipe(
      filter(done => done !== null),
      take(1),
      switchMap(() => ajax(requestObj).pipe(switchMap(r => of(r.response))))
    );
  }
};

const handleError = (error, requestObj) => {
  if (error.status === 401) {
    return handle401Error(requestObj);
  }

  let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
  if (error.response) {
    switch (error.status) {
      case 400: errorMessage = error.response.message || "Yêu cầu không hợp lệ."; break;
      case 403: errorMessage = "Bạn không có quyền thực hiện hành động này."; break;
      case 404: errorMessage = "Không tìm thấy dữ liệu."; break;
      case 500: errorMessage = "Lỗi hệ thống máy chủ."; break;
    }
  }
  
  toast.error(errorMessage);
  return throwError(() => error);
};

// #region Hàm request 
const request = (method, url, body = null, options = {}) => {
    return defer(() => {
        const fullUrl = buildRequestUrl(`${BASE_URL}${url}`, options.search);
        const headers = extractHeaders({ ...options, body: body ? JSON.stringify(body) : null });
        const cleanOptions = removeCustomKeys(options);
        const requestObj = {
            url: fullUrl,
            method,
            headers,
            withCredentials: true,
            ...(body && { body }),
            ...cleanOptions
        };
        return ajax(requestObj).pipe(
            switchMap(res => of(res.response)),
            catchError(error => handleError(error, requestObj))
        );
    });
};

const HttpClient = {
  get: (url, headers) => request('GET', url, null, headers),
  post: (url, body, headers) => request('POST', url, body, headers),
  put: (url, body, headers) => request('PUT', url, body, headers),
  patch: (url, body, headers) => request('PATCH', url, body, headers),
  delete: (url, headers) => request('DELETE', url, null, headers),
};

export default HttpClient;