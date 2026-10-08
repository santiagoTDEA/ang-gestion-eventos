import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Event, ReturnEvent } from '../interfaces/events.interfaces';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private readonly http: HttpClient) { }

  postCreateEvent(event: Event): Observable<ReturnEvent> {
    return this.http.post<ReturnEvent>(`${environment.apiUrl}events`, event);
  }

  updateEvent(id: number, event: Event): Observable<ReturnEvent> {
    return this.http.patch<ReturnEvent>(`${environment.apiUrl}events/${id}`, event);
  }

  getEvents(): Observable<ReturnEvent[]> {
    return this.http.get<ReturnEvent[]>(`${environment.apiUrl}events`);
  }

  getEventById(id: number): Observable<ReturnEvent> {
    return this.http.get<ReturnEvent>(`${environment.apiUrl}events/${id}`);
  }
}
