import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApprovalService } from './services/approval.service';
import { APPROVAL_FLOW, FlowStep, StepState } from './interfaces/approval.interfaces';
import { EventObservation, ReturnEvent } from '../events/interfaces/events.interfaces';
import { PeoplesService } from '../peoples/services/peoples.service';
import { Person } from '../peoples/interfaces/people.interfaces';
import { JwtService } from '../../core/services/jwt.service';
import { ValidateRenderingService } from '../inicio/services/validate-rendering.service';
import { GenericAlertComponent } from '../../../shared/atoms/generic-alert/generic-alert.component';
import { GenericAlertResponse } from '../../../shared/atoms/generic-alert/utils/style';

/** Nombre sin tildes ni mayúsculas, para cruzar el rol de la aprobación con el workflow. */
const normalize = (value?: string): string =>
  (value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, GenericAlertComponent],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.css'
})
export class ApprovalsComponent implements OnInit {
  private readonly approvalService = inject(ApprovalService);
  private readonly peoplesService = inject(PeoplesService);
  private readonly jwtService = inject(JwtService);
  private readonly validateRenderingService = inject(ValidateRenderingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly acceso = this.validateRenderingService.permisosDelModulo('aprobaciones');
  readonly flow = APPROVAL_FLOW;

  events: ReturnEvent[] = [];
  selectedEventId: number | null = null;
  /** Persona vinculada al usuario autenticado (a quién le toca firmar). */
  private myPersonId: number | null = null;
  private myUserId: string | null = null;

  loading = false;
  signing = false;
  showSignatureModal = false;
  showReturnModal = false;
  returning = false;

  readonly observationControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]
  });

  alertaResponse: GenericAlertResponse = {
    alertVisible: false,
    alertType: 'success',
    alertTitle: '',
    alertMessage: ''
  };

  ngOnInit(): void {
    if (!this.acceso.canView) {
      this.router.navigate(['/inicio']);
      return;
    }

    this.loadMyPerson();
    this.loadEvents();
  }

  get selectedEvent(): ReturnEvent | null {
    return this.events.find(event => event.id === this.selectedEventId) ?? null;
  }

  get selectedSteps(): FlowStep[] {
    return this.selectedEvent ? this.stepsOf(this.selectedEvent) : [];
  }

  /** Paso que está esperando firma en el evento seleccionado. */
  get currentStep(): FlowStep | null {
    return this.selectedSteps.find(step => step.state === 'current') ?? null;
  }

  get canSignCurrent(): boolean {
    return !!this.currentStep?.mine && this.acceso.canEdit && !this.isReturned(this.selectedEvent);
  }

  get completedCount(): number {
    return this.events.filter(event => this.isComplete(event)).length;
  }

  get pendingForMe(): number {
    return this.events.filter(event => this.isMyTurn(event)).length;
  }

  isReturned(event: ReturnEvent | null): boolean {
    return event?.workflowStatus === 'devuelto';
  }

  /** Observaciones del evento, de la más reciente a la más antigua. */
  observationsOf(event: ReturnEvent): EventObservation[] {
    return [...(event.observations ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  openObservation(event: ReturnEvent): EventObservation | null {
    return this.observationsOf(event).find(item => !item.resolvedAt) ?? null;
  }

  /** El autor es quien creó el evento o la persona asignada al primer paso. */
  isAuthor(event: ReturnEvent): boolean {
    const byCreation = !!this.myUserId && event.createdBy === this.myUserId;
    return byCreation || (this.stepsOf(event)[0]?.mine ?? false);
  }

  /** El evento está devuelto y le toca corregirlo al usuario actual. */
  needsMyFix(event: ReturnEvent): boolean {
    return this.isReturned(event) && this.isAuthor(event);
  }

  selectEvent(event: ReturnEvent): void {
    this.selectedEventId = event.id;
  }

  /** Une el workflow con las aprobaciones del evento y marca cuál es el paso actual. */
  stepsOf(event: ReturnEvent): FlowStep[] {
    let currentAssigned = false;

    return this.flow.map(meta => {
      const approval = event.approvals.find(item => normalize(item.role?.name) === meta.key);
      const signed = approval?.status === 'aprobado';

      let state: StepState = 'pending';
      if (signed) {
        state = 'approved';
      } else if (!currentAssigned) {
        state = 'current';
        currentAssigned = true;
      }

      return {
        ...meta,
        approvalId: approval?.id ?? 0,
        state,
        personName: approval?.person?.name || approval?.person?.email || 'Sin asignar',
        personEmail: approval?.person?.email ?? '',
        signature: approval?.signature ?? '',
        signedAt: approval?.signedAt ?? null,
        mine: !!approval && approval.person?.id === this.myPersonId
      };
    });
  }

  isComplete(event: ReturnEvent): boolean {
    return this.stepsOf(event).every(step => step.state === 'approved');
  }

  isMyTurn(event: ReturnEvent): boolean {
    return !this.isReturned(event) && this.stepsOf(event).some(step => step.state === 'current' && step.mine);
  }

  statusLabel(event: ReturnEvent): string {
    if (this.isComplete(event)) return 'Aprobado';
    if (this.isReturned(event)) return `Devuelto por ${this.openObservation(event)?.stepRole ?? 'un responsable'}`;
    const current = this.stepsOf(event).find(step => step.state === 'current');
    return current ? `Pendiente: ${current.title}` : '';
  }

  openSignatureModal(): void {
    if (this.canSignCurrent) {
      this.showSignatureModal = true;
    }
  }

  closeSignatureModal(): void {
    this.showSignatureModal = false;
  }

  /** Firma electrónica: confirma el paso con la firma que ya está registrada en el evento. */
  confirmSignature(): void {
    const event = this.selectedEvent;
    if (!event || !this.canSignCurrent || this.signing) return;

    this.signing = true;
    this.approvalService.signCurrentStep(event.id).subscribe({
      next: updated => {
        this.events = this.events.map(item => (item.id === updated.id ? updated : item));
        this.signing = false;
        this.closeSignatureModal();
        this.showAlert(
          'success',
          this.isComplete(updated) ? 'Evento aprobado' : 'Firma registrada',
          this.isComplete(updated)
            ? 'El evento completó el flujo de aprobación.'
            : 'El evento avanzó al siguiente paso del flujo.'
        );
      },
      error: err => {
        this.signing = false;
        this.closeSignatureModal();
        const message = err?.error?.message;
        this.showAlert('error', 'No se pudo firmar', Array.isArray(message) ? message.join(' ') : (message ?? 'Ocurrió un error al registrar la firma.'));
      }
    });
  }

  openReturnModal(): void {
    if (this.canSignCurrent) {
      this.observationControl.reset('');
      this.showReturnModal = true;
    }
  }

  closeReturnModal(): void {
    this.showReturnModal = false;
  }

  /** Devuelve el evento al autor; la observación es obligatoria y queda en el historial. */
  confirmReturn(): void {
    const event = this.selectedEvent;
    if (!event || !this.canSignCurrent || this.returning) return;

    if (this.observationControl.invalid) {
      this.observationControl.markAsTouched();
      return;
    }

    this.returning = true;
    this.approvalService.returnToAuthor(event.id, this.observationControl.value.trim()).subscribe({
      next: updated => {
        this.replaceEvent(updated);
        this.returning = false;
        this.closeReturnModal();
        this.showAlert('warning', 'Evento devuelto', 'Se devolvió al autor con tu observación.');
      },
      error: err => {
        this.returning = false;
        this.showAlert('error', 'No se pudo devolver', this.errorMessage(err, 'Ocurrió un error al devolver el evento.'));
      }
    });
  }

  /** El autor reenvía el evento ya corregido; el flujo sigue en el paso que lo devolvió. */
  resubmit(): void {
    const event = this.selectedEvent;
    if (!event || !this.needsMyFix(event)) return;

    this.approvalService.resubmit(event.id).subscribe({
      next: updated => {
        this.replaceEvent(updated);
        this.showAlert('success', 'Evento reenviado', 'El flujo continúa en el paso que lo devolvió.');
      },
      error: err => this.showAlert('error', 'No se pudo reenviar', this.errorMessage(err, 'Ocurrió un error al reenviar el evento.'))
    });
  }

  goToEvents(): void {
    this.router.navigate(['/eventos'], { queryParams: { editar: this.selectedEventId } });
  }

  private replaceEvent(updated: ReturnEvent): void {
    this.events = this.events.map(item => (item.id === updated.id ? updated : item));
  }

  private errorMessage(err: { error?: { message?: string | string[] } }, fallback: string): string {
    const message = err?.error?.message;
    return Array.isArray(message) ? message.join(' ') : (message ?? fallback);
  }

  private loadMyPerson(): void {
    const token = localStorage.getItem('accessToken');
    const userId = token ? this.jwtService.obtenerUserId(token) : null;
    this.myUserId = userId;
    if (!userId) return;

    this.peoplesService.getPeoples().subscribe({
      next: (people: Person[]) => {
        this.myPersonId = people.find(person => person.user?.id === userId)?.id ?? null;
      },
      error: err => console.error(err)
    });
  }

  private loadEvents(): void {
    this.loading = true;
    this.approvalService.getEvents().subscribe({
      next: events => {
        this.events = events;
        this.loading = false;
        const requestedId = Number(this.route.snapshot.queryParamMap.get('evento'));
        const firstPending = events.find(event => event.id === requestedId) ?? events.find(event => this.isMyTurn(event)) ?? events[0];
        if (firstPending) this.selectEvent(firstPending);
      },
      error: err => {
        console.error(err);
        this.loading = false;
        this.showAlert('error', 'Error', 'No se pudieron cargar los eventos.');
      }
    });
  }

  private showAlert(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    this.alertaResponse = { alertVisible: true, alertType: type, alertTitle: title, alertMessage: message };
  }

  goBack(): void {
    this.router.navigate(['/inicio']);
  }
}
