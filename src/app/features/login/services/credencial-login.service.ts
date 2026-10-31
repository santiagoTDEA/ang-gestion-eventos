import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { ChangePasswordCredentials, LoginCredentials } from '../interfaces/login.interfaces';
import { JwtService } from '../../../core/services/jwt.service';

export interface LoginResponse {
  accessToken: string;
}

export interface LoginErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class CredencialLoginService {

  private readonly apiUrl = environment.apiUrl;
  private readonly jwtService = inject(JwtService);

  constructor(private readonly http: HttpClient) { }

  async postCredentials(
    credentials: LoginCredentials
  ): Promise<LoginResponse> {

    try {
      return await firstValueFrom(
        this.http.post<LoginResponse>(
          `${this.apiUrl}auth/validate-credentials`,
          credentials
        )
      );
    } catch (error) {
      throw error;
    }
  }

  async changePassword(credentials: ChangePasswordCredentials): Promise<unknown> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(
        `${this.apiUrl}auth/validate-credentials`,
        {
          username: credentials.username,
          password: credentials.currentPassword
        }
      )
    );

    const userId = this.jwtService.obtenerUserId(response.accessToken);
    if (!userId) {
      throw new Error('No se pudo identificar al usuario.');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${response.accessToken}`
    });

    return firstValueFrom(
      this.http.patch(
        `${this.apiUrl}auth/users/${userId}`,
        {
          username: credentials.username,
          password: credentials.newPassword
        },
        { headers }
      )
    );
  }
}