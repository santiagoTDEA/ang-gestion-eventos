import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  role: { id: string; name: string } | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Perfil (nombre y rol) del usuario autenticado. */
@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}auth/me`;

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.url);
  }

  /** Cambia la contraseña del usuario autenticado; el backend exige la actual. */
  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.url}/password`, data);
  }
}
