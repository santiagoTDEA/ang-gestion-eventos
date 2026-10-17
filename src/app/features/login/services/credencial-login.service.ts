import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { LoginCredentials } from '../interfaces/login.interfaces';

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
}