import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CertificateEvent, EventCertificates } from '../interfaces/certificates.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CertificatesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}certificates`;

  getEvents(): Observable<CertificateEvent[]> {
    return this.http.get<CertificateEvent[]>(`${this.url}/events`);
  }

  getByEvent(eventId: number): Observable<EventCertificates> {
    return this.http.get<EventCertificates>(`${this.url}/events/${eventId}`);
  }
}
