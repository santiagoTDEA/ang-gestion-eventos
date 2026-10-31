import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  EventRegistrations,
  ImportResult,
  RegisterResult,
  RegistrationData,
  RegistrationEvent
} from '../interfaces/registrations.interfaces';

@Injectable({
  providedIn: 'root'
})
export class RegistrationsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}registrations`;

  getEvents(): Observable<RegistrationEvent[]> {
    return this.http.get<RegistrationEvent[]>(`${this.url}/events`);
  }

  getByEvent(eventId: number): Observable<EventRegistrations> {
    return this.http.get<EventRegistrations>(`${this.url}/events/${eventId}`);
  }

  register(eventId: number, data: RegistrationData): Observable<RegisterResult> {
    return this.http.post<RegisterResult>(`${this.url}/events/${eventId}`, data);
  }

  importExcel(eventId: number, file: File): Observable<ImportResult> {
    const body = new FormData();
    body.append('file', file);

    return this.http.post<ImportResult>(`${this.url}/events/${eventId}/import`, body);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getTemplate(): Observable<Blob> {
    return this.http.get(`${this.url}/template`, { responseType: 'blob' });
  }
}
