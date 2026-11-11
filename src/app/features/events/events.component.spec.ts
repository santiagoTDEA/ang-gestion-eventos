import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { EventsComponent } from './events.component';
import { EventsService } from './services/events.service';
import { FacultyService } from '../faculty/services/faculty.service';
import { RolesService } from '../roles/services/roles.service';
import { PeoplesService } from '../peoples/services/peoples.service';
import { ValidateRenderingService } from '../inicio/services/validate-rendering.service';
import { JwtService } from '../../core/services/jwt.service';
import { ReturnEvent } from './interfaces/events.interfaces';

type Step = ReturnEvent['approvals'][number];

function step(id: number, roleName: string, status: Step['status']): Step {
  return {
    id,
    date: '2026-11-01',
    signature: status === 'aprobado' ? `FD-${id}` : null,
    status,
    signedAt: null,
    person: { id, name: `Persona ${id}`, email: `p${id}@correo.com` },
    role: { id: `role-${id}`, name: roleName }
  };
}

function makeEvent(overrides: Partial<ReturnEvent> = {}, approved = false): ReturnEvent {
  const pending = approved ? 'aprobado' : 'pendiente';
  return {
    id: 1,
    eventType: 'Curso',
    name: 'Curso de prueba',
    faculty: { id: 1, name: 'Ingeniería' },
    academicProgram: 'Sistemas',
    teacherProfile: 'Docente',
    duration: 10,
    startTime: '08:00:00',
    endTime: '12:00:00',
    selectedDays: ['Lun'],
    modality: 'Presencial',
    startDate: '2026-12-07',
    endDate: '2026-12-07',
    minimumCapacity: 5,
    maximumCapacity: 20,
    participantProfile: 'Estudiantes',
    presentation: 'p',
    scope: 's',
    generalObjective: 'g',
    objectives: ['a', 'b', 'c'],
    competencies: 'c',
    modules: ['m'],
    logistics: {},
    costPerParticipant: 0,
    confirmedMinimumCapacity: 5,
    financialObservations: 'f',
    approvals: [
      step(1, 'Elaboración', 'aprobado'),
      step(2, 'Revisión', 'aprobado'),
      step(3, 'Verificación', pending),
      step(4, 'Validación', pending)
    ],
    workflowStatus: 'en_flujo',
    observations: [],
    createdAt: '2026-11-01T00:00:00Z',
    cancelledAt: null,
    canManage: false,
    ...overrides
  };
}

describe('EventsComponent · cancelar, reactivar y editar', () => {
  let fixture: ComponentFixture<EventsComponent>;
  let component: EventsComponent;
  let events: jasmine.SpyObj<EventsService>;
  let access: 'all' | 'update' | 'view';

  const el = () => fixture.nativeElement as HTMLElement;
  const rows = () => Array.from(el().querySelectorAll<HTMLTableRowElement>('tbody tr'));

  function create(list: ReturnEvent[]): void {
    events.getEvents.and.returnValue(of(list));
    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    access = 'update';
    localStorage.setItem('accessToken', 'token');
    localStorage.removeItem('eventDraft:v2');

    events = jasmine.createSpyObj<EventsService>('EventsService',
      ['getEvents', 'cancelEvent', 'reactivateEvent', 'getEventById', 'updateEvent', 'postCreateEvent']);

    TestBed.configureTestingModule({
      imports: [EventsComponent],
      providers: [
        { provide: EventsService, useValue: events },
        { provide: FacultyService, useValue: { getFaculties: () => of([]) } },
        { provide: RolesService, useValue: { getRoles: () => of([]) } },
        { provide: PeoplesService, useValue: { getPeoples: () => of([]) } },
        { provide: JwtService, useValue: { cargarDesdeToken: () => ({}) } },
        { provide: ValidateRenderingService, useValue: { devolverAccesosPermitidos: () => access } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } }
      ]
    });
  });

  afterEach(() => localStorage.removeItem('accessToken'));

  it('muestra el botón rojo Cancelar solo a quien puede gestionar el evento', () => {
    create([makeEvent({ id: 1, canManage: true }), makeEvent({ id: 2, name: 'Otro', canManage: false })]);

    expect(rows()[0].querySelector('.eventos__accion--cancelar')).not.toBeNull();
    expect(rows()[1].querySelector('.eventos__accion--cancelar')).toBeNull();
  });

  it('un evento cancelado se sigue viendo, con botón gris, sin poder editarse', () => {
    create([makeEvent({ cancelledAt: '2026-11-10T00:00:00Z', cancellationReason: 'Sin cupo', canManage: true })]);
    const row = rows()[0];
    const startEdit = spyOn(component, 'startEdit').and.callThrough();

    const gray = row.querySelector<HTMLButtonElement>('.eventos__accion--cancelado');
    expect(gray?.disabled).toBeTrue();
    expect(row.querySelector('.eventos__accion--cancelar')).toBeNull();
    expect(row.textContent).toContain('Cancelado');
    expect(row.getAttribute('role')).toBeNull();

    row.click();
    expect(startEdit).not.toHaveBeenCalled();
    expect(component.editingId).toBeNull();
  });

  it('el botón Cancelar abre el modal sin abrir la edición y exige motivo', () => {
    create([makeEvent({ canManage: true })]);
    const startEdit = spyOn(component, 'startEdit');

    rows()[0].querySelector<HTMLButtonElement>('.eventos__accion--cancelar')!.click();
    fixture.detectChanges();

    expect(startEdit).not.toHaveBeenCalled();
    expect(el().querySelector('[role="alertdialog"]')).not.toBeNull();

    component.cancelReasonControl.setValue('corto');
    component.confirmCancel();
    expect(events.cancelEvent).not.toHaveBeenCalled();
  });

  it('cancela con el motivo y actualiza la fila', () => {
    const event = makeEvent({ canManage: true });
    create([event]);
    events.cancelEvent.and.returnValue(of({ ...event, cancelledAt: '2026-11-11T00:00:00Z', cancellationReason: 'No hubo cupo mínimo' }));

    component.askCancel(event);
    component.cancelReasonControl.setValue('  No hubo cupo mínimo  ');
    component.confirmCancel();
    fixture.detectChanges();

    expect(events.cancelEvent).toHaveBeenCalledWith(1, 'No hubo cupo mínimo');
    expect(component.cancelTarget).toBeNull();
    expect(component.isCancelled(component.events[0])).toBeTrue();
    expect(rows()[0].querySelector('.eventos__accion--cancelado')).not.toBeNull();
    expect(component.alertaResponse.alertTitle).toBe('Evento cancelado');
  });

  it('muestra el error del servidor si no se pudo cancelar', () => {
    const event = makeEvent({ canManage: true });
    create([event]);
    events.cancelEvent.and.returnValue(throwError(() => ({ error: { message: 'Sin permiso' } })));

    component.askCancel(event);
    component.cancelReasonControl.setValue('Motivo suficiente');
    component.confirmCancel();

    expect(component.alertaResponse.alertType).toBe('error');
    expect(component.actionLoading).toBeFalse();
    expect(component.isCancelled(component.events[0])).toBeFalse();
  });

  it('reactiva un evento cancelado y vuelve a su estado', () => {
    const cancelled = makeEvent({ cancelledAt: '2026-11-10T00:00:00Z', canManage: true });
    create([cancelled]);
    events.reactivateEvent.and.returnValue(of({ ...cancelled, cancelledAt: null }));

    rows()[0].querySelector<HTMLButtonElement>('.eventos__accion--reactivar')!.click();
    component.confirmReactivate();
    fixture.detectChanges();

    expect(events.reactivateEvent).toHaveBeenCalledWith(1);
    expect(component.statusLabel(component.events[0])).toBe('En aprobación');
    expect(rows()[0].querySelector('.eventos__accion--cancelar')).not.toBeNull();
  });

  it('no muestra Reactivar a quien no gestiona el evento', () => {
    create([makeEvent({ cancelledAt: '2026-11-10T00:00:00Z', canManage: false })]);

    expect(rows()[0].querySelector('.eventos__accion--reactivar')).toBeNull();
    expect(rows()[0].querySelector('.eventos__accion--cancelado')).not.toBeNull();
  });

  describe('edición', () => {
    it('un evento aprobado no se edita sin ser administrador o responsable de Verificación', () => {
      const approved = makeEvent({ canManage: false }, true);
      create([approved]);

      expect(component.canEditEvent(approved)).toBeFalse();
      component.startEdit(approved);
      expect(component.editingId).toBeNull();
    });

    it('administrador o Verificación editan un evento aprobado con aprobaciones bloqueadas', () => {
      const approved = makeEvent({ canManage: true }, true);
      create([approved]);

      expect(component.canEditEvent(approved)).toBeTrue();
      component.startEdit(approved);

      expect(component.editingId).toBe(1);
      expect(component.approvalsLocked).toBeTrue();
    });

    it('pueden editar aunque su permiso del módulo sea solo de lectura', () => {
      access = 'view';
      const inFlow = makeEvent({ canManage: true });
      create([inFlow]);

      expect(component.canEditEvent(inFlow)).toBeTrue();
      component.startEdit(inFlow);
      expect(component.editingId).toBe(1);
      expect(component.approvalsLocked).toBeFalse();
    });

    it('un evento en flujo se sigue editando como antes para quien tiene permiso', () => {
      const inFlow = makeEvent({ canManage: false });
      create([inFlow]);

      expect(component.canEditEvent(inFlow)).toBeTrue();
    });
  });
});
