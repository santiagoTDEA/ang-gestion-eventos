import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';
import { ApprovalFlow, ApproveDto, RejectDto, ApprovalResponse } from '../interfaces/approval.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {

  constructor(private readonly http: HttpClient) { }

  // Obtener flujo de aprobación por evento
  getApprovalFlow(eventId: string): Observable<ApprovalFlow> {
    return this.http.get<ApprovalFlow>(`${environment.apiUrl}approvals/event/${eventId}`);
  }

  // Aprobar paso
  approveStep(dto: ApproveDto): Observable<ApprovalResponse> {
    return this.http.post<ApprovalResponse>(`${environment.apiUrl}approvals/approve`, dto);
  }

  // Rechazar paso
  rejectStep(dto: RejectDto): Observable<ApprovalResponse> {
    return this.http.post<ApprovalResponse>(`${environment.apiUrl}approvals/reject`, dto);
  }

  // Obtener historial de aprobaciones
  getApprovalHistory(eventId: string): Observable<ApprovalFlow[]> {
    return this.http.get<ApprovalFlow[]>(`${environment.apiUrl}approvals/history/${eventId}`);
  }
}