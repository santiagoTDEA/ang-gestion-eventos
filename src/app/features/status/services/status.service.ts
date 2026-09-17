import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateStatusDto, Status } from '../interfaces/status.interfaces';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor(private http: HttpClient) { }
  
  getStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(`${environment.apiUrl}statuses`);
  }

  postStatus(status: CreateStatusDto): Observable<Status> {
    return this.http.post<Status>(`${environment.apiUrl}statuses`, status);
  }

  updateStatus(id: number, status: CreateStatusDto): Observable<Status> {
    return this.http.patch<Status>(`${environment.apiUrl}statuses/${id}`, status);
  }
}
