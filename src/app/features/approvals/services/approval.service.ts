import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EventsService } from '../../events/services/events.service';
import { ReturnEvent } from '../../events/interfaces/events.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
  private readonly eventsService = inject(EventsService);

  /** Eventos visibles para el usuario con el estado de cada paso del workflow. */
  getEvents(): Observable<ReturnEvent[]> {
    return this.eventsService.getEvents();
  }

  /** Devuelve el evento al autor con la observación del responsable. */
  returnToAuthor(eventId: number, observation: string): Observable<ReturnEvent> {
    return this.eventsService.returnEvent(eventId, observation);
  }

  /** El autor reenvía el evento corregido para que el flujo continúe. */
  resubmit(eventId: number): Observable<ReturnEvent> {
    return this.eventsService.resubmitEvent(eventId);
  }

  /** Firma el paso actual con la firma que ya quedó registrada en el evento. */
  signCurrentStep(eventId: number): Observable<ReturnEvent> {
    return this.eventsService.approveEvent(eventId);
  }
}
