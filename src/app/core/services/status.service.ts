import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Status } from '../interfaces/status.interfaces';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor(private http: HttpClient) { }

  getStatusOptions():Observable<Status[]> {
    return this.http.get<Status[]>(`${environment.apiUrl}statuses`);
  }
}
  