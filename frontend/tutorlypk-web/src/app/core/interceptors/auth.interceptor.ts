import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthResult } from '../models/api.models';
import { AuthService } from '../auth/auth.service';

let refreshRequest$: Observable<AuthResult> | undefined;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (request.url.includes('/api/auth/')) {
    return next(request);
  }

  return next(withAccessToken(request, authService.accessToken)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || !authService.refreshToken) {
        return throwError(() => error);
      }

      refreshRequest$ ??= authService.refresh().pipe(
        finalize(() => {
          refreshRequest$ = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

      return refreshRequest$.pipe(
        catchError(refreshError => {
          authService.clearSession();
          void router.navigate(['/login'], {
            queryParams: { returnUrl: router.url, reason: 'session-expired' },
          });
          return throwError(() => refreshError);
        }),
        switchMap(() => next(withAccessToken(request, authService.accessToken))),
      );
    }),
  );
};

function withAccessToken(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;
}
