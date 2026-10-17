import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type NotificationType =
  | 'creado'
  | 'asignado'
  | 'turno'
  | 'firmado'
  | 'devuelto'
  | 'reenviado'
  | 'aprobado';

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
  eventId: number;
  eventName: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationsResponse {
  unread: number;
  items: AppNotification[];
}

/** Notificaciones del flujo de eventos del usuario autenticado. */
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}notifications`;

  getMine(): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(this.url);
  }

  markRead(id: number): Observable<{ ok: boolean }> {
    return this.http.patch<{ ok: boolean }>(`${this.url}/${id}/read`, {});
  }

  markAllRead(): Observable<{ ok: boolean }> {
    return this.http.patch<{ ok: boolean }>(`${this.url}/read-all`, {});
  }
}
