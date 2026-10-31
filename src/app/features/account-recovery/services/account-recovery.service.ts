import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RecoveryRequested {
  message: string;
  expiresInMinutes: number;
  resendInSeconds: number;
}

export interface RecoveryVerified {
  resetToken: string;
  expiresInMinutes: number;
}

/** Recuperación de cuenta por correo: endpoints públicos, sin sesión. */
@Injectable({
  providedIn: 'root'
})
export class AccountRecoveryService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}auth/recovery`;

  request(username: string, email: string): Observable<RecoveryRequested> {
    return this.http.post<RecoveryRequested>(`${this.url}/request`, { username, email });
  }

  verify(username: string, code: string): Observable<RecoveryVerified> {
    return this.http.post<RecoveryVerified>(`${this.url}/verify`, { username, code });
  }

  reset(resetToken: string, newPassword: string, confirmPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.url}/reset`, { resetToken, newPassword, confirmPassword });
  }
}
