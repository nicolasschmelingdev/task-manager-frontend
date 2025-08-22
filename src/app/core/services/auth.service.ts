import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type LoginResponse = { accessToken: string; tokenType: 'Bearer' };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private storageKey = 'accessToken';

  login(username: string, password: string): Observable<LoginResponse> {
    // environment.apiBaseUrl já inclui '/api' neste projeto
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { username, password });
  }

  saveToken(token: string) {
    localStorage.setItem(this.storageKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  logout() {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
