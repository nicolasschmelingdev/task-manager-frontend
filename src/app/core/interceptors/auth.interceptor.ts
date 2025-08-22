import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err?.status === 401) {
        // Não redireciona em 401 do próprio login
        const isLoginRequest = (req.url || '').includes('/auth/login');
        if (isLoginRequest) {
          return throwError(() => err);
        }
        // Token inválido/expirado ou não autenticado
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
