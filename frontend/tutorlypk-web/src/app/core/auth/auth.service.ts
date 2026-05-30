import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap, throwError } from 'rxjs';
import { ApiResponse, AuthResult, AuthUser, LoginRequest, RegisterRequest } from '../models/api.models';
import { apiUrl } from '../api-endpoints';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = apiUrl('/api/auth');
  private readonly tokenKey = 'tutorly_access_token';
  private readonly refreshTokenKey = 'tutorly_refresh_token';
  private readonly expiresKey = 'tutorly_expires_at';
  private readonly userKey = 'tutorly_user';

  constructor(private readonly http: HttpClient) {}

  get accessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  get currentUser(): AuthUser | null {
    const value = localStorage.getItem(this.userKey);
    return value ? JSON.parse(value) as AuthUser : null;
  }

  login(request: LoginRequest): Observable<AuthResult> {
    return this.http.post<ApiResponse<AuthResult>>(`${this.baseUrl}/login`, request).pipe(
      map(response => response.data),
      tap(result => this.setSession(result)),
    );
  }

  register(request: RegisterRequest): Observable<AuthResult> {
    return this.http.post<ApiResponse<AuthResult>>(`${this.baseUrl}/register`, request).pipe(
      map(response => response.data),
      tap(result => this.setSession(result)),
    );
  }

  refresh(): Observable<AuthResult> {
    const refreshToken = this.refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token is unavailable.'));
    }

    return this.http.post<ApiResponse<AuthResult>>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      map(response => response.data),
      tap(result => this.setSession(result)),
    );
  }

  setSession(result: AuthResult): void {
    localStorage.setItem(this.tokenKey, result.accessToken);
    localStorage.setItem(this.refreshTokenKey, result.refreshToken);
    localStorage.setItem(this.expiresKey, result.expiresAtUtc);
    localStorage.setItem(this.userKey, JSON.stringify(result.user));
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.expiresKey);
    localStorage.removeItem(this.userKey);
  }

  isSignedIn(): boolean {
    const token = this.accessToken;
    const expiresAt = localStorage.getItem(this.expiresKey);

    if (!token || !expiresAt) {
      return false;
    }

    if (Date.parse(expiresAt) <= Date.now()) {
      return false;
    }

    return true;
  }
}
