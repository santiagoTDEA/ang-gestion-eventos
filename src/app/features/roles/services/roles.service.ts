import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ReturnRole, Role } from '../interfaces/roles.interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private readonly http: HttpClient) { }

  createRole(payload: Role):Observable<Role> {
    return this.http.post<Role>(`${environment.apiUrl}roles`, payload);
  }

  getRoles(): Observable<ReturnRole[]> {
    return this.http.get<ReturnRole[]>(`${environment.apiUrl}roles`);
  }

  updateRole(id: string, payload: Role): Observable<Role> {
    return this.http.patch<Role>(`${environment.apiUrl}roles/${id}`, payload);
  }
}
