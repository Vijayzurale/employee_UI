import { HttpInterceptorFn } from '@angular/common/http';

import { API_BASE_URL } from './api.config';

const TOKEN_KEYS = ['token', 'jwt', 'jwtToken', 'accessToken', 'access_token', 'authToken'];

function getJwtToken(): string {
  const localData = localStorage.getItem('empLoginUser');

  if (!localData) {
    return '';
  }

  try {
    const loginUser = JSON.parse(localData) as Record<string, unknown>;
    const tokenKey = TOKEN_KEYS.find((key) => typeof loginUser[key] === 'string');

    return tokenKey ? String(loginUser[tokenKey]) : '';
  } catch {
    return '';
  }
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = getJwtToken();
  const isApiRequest = request.url.startsWith(API_BASE_URL);

  if (!token || !isApiRequest) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};
