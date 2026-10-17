import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateUserDto, UserResponse } from '../interfaces/users.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }


  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${environment.apiUrl}auth/users`);
  }

  postUser(user: CreateUserDto): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${environment.apiUrl}auth/users`, user);
  }

  updateUser(id: string, user: CreateUserDto): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${environment.apiUrl}auth/users/${id}`, user);
  }
}
