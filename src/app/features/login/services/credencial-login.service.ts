import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginCredentials } from '../interfaces/login.interfaces';
@Injectable({
  providedIn: 'root'
})
export class CredencialLoginService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private readonly http: HttpClient) {

  }

  async postCredentials(credentials: LoginCredentials) {
    return await firstValueFrom(this.http.post(`${this.apiUrl}auth/validate-credentials`, credentials));
  }
}
