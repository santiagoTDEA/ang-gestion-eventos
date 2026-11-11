import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegistrationsComponent } from './registrations.component';
import { RegistrationsService } from './services/registrations.service';
import { ValidateRenderingService } from '../inicio/services/validate-rendering.service';
import { ImportResult, Registration, RegistrationEvent } from './interfaces/registrations.interfaces';

const event = (changes: Partial<RegistrationEvent> = {}): RegistrationEvent => ({
  id: 1, name: 'Diplomado', eventType: 'Diplomado', faculty: 'Ingeniería', modality: 'Presencial',
  startDate: '2026-11-01', endDate: '2026-11-02', startTime: '08:00', endTime: '12:00',
  minimumCapacity: 1, maximumCapacity: 3, registeredCount: 1, availableSlots: 2, ...changes
});

const person = (id: number, changes: Partial<Registration> = {}): Registration => ({
  id, position: id, documentType: 'CC', documentNumber: `1000${id}`, firstNames: 'Ana', lastNames: 'Ruiz',
  email: 'ana@correo.com', phone: '3001234567', source: 'formulario', createdAt: '2026-10-30', ...changes
});

const validForm = {
  documentType: 'CC' as const, documentNumber: '1037654321', firstNames: 'Santiago',
  lastNames: 'Ospina', email: 'santiago@correo.com', phone: '3001234567'
};

describe('RegistrationsComponent', () => {
  let fixture: ComponentFixture<RegistrationsComponent>;
  let component: RegistrationsComponent;
  let service: jasmine.SpyObj<RegistrationsService>;
  let router: jasmine.SpyObj<Router>;

  function create(access = { canView: true, canCreate: true, canEdit: true, nivel: 'all' }, query = {}) {
    service = jasmine.createSpyObj('RegistrationsService',
      ['getEvents', 'getByEvent', 'register', 'importExcel', 'remove', 'getTemplate']);
    service.getEvents.and.returnValue(of([event(), event({ id: 2, name: 'Taller' })]));
    service.getByEvent.and.callFake(id => of({ event: event({ id }), registrations: [person(1)] }));
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RegistrationsComponent],
      providers: [
        { provide: RegistrationsService, useValue: service },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
        { provide: ValidateRenderingService, useValue: { permisosDelModulo: () => access } }
      ]
    });

    fixture = TestBed.createComponent(RegistrationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  describe('acceso', () => {
    it('saca al usuario sin permiso de ver', () => {
      create({ canView: false, canCreate: false, canEdit: false, nivel: 'none' });
      expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
      expect(service.getEvents).not.toHaveBeenCalled();
    });

    it('sin permiso de crear no muestra el botón de registrar asistencia ni el de retirar', () => {
      create({ canView: true, canCreate: false, canEdit: false, nivel: 'view' });
      component.eventControl.setValue(1);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.registrations__quitar')).toBeNull();
      expect(text()).not.toContain('Registrar asistencia');
    });
  });

  describe('eventos', () => {
    it('carga los eventos y selecciona el que viene en la URL', () => {
      create(undefined, { evento: '2' });
      expect(component.events.length).toBe(2);
      expect(component.eventControl.value).toBe(2);
      expect(service.getByEvent).toHaveBeenCalledWith(2);
    });

    it('ignora un evento de la URL que no está en la lista', () => {
      create(undefined, { evento: '99' });
      expect(component.eventControl.value).toBeNull();
    });

    it('calcula ocupación y cupo lleno', () => {
      create();
      component.eventControl.setValue(1);
      expect(component.occupancy).toBe(33);
      expect(component.isFull).toBeFalse();

      component.events = [event({ registeredCount: 3, availableSlots: 0 })];
      expect(component.isFull).toBeTrue();
      expect(component.occupancy).toBe(100);
    });

    it('con el cupo lleno muestra el aviso en lugar del formulario', () => {
      create();
      service.getByEvent.and.returnValue(of({ event: event({ registeredCount: 3, availableSlots: 0 }), registrations: [] }));
      component.eventControl.setValue(1);
      component.toggleForm();
      fixture.detectChanges();

      expect(text()).toContain('El evento ya llenó su cupo máximo');
      expect(fixture.nativeElement.querySelector('form')).toBeNull();
    });

    it('busca asistentes por nombre, documento o correo', () => {
      create();
      component.registrations = [
        person(1, { firstNames: 'Laura' }),
        person(2, { documentNumber: '555777', email: 'pedro@uni.edu' })
      ];
      component.searchControl.setValue('laura');
      expect(component.filteredRegistrations.map(r => r.id)).toEqual([1]);
      component.searchControl.setValue('555777');
      expect(component.filteredRegistrations.map(r => r.id)).toEqual([2]);
      component.searchControl.setValue('UNI.EDU');
      expect(component.filteredRegistrations.map(r => r.id)).toEqual([2]);
    });

    it('descarta la respuesta de un evento si el usuario ya cambió a otro', () => {
      create();
      let respond!: () => void;
      service.getByEvent.and.callFake(() => ({
        subscribe: (o: { next: (v: unknown) => void }) => { respond = () => o.next({ event: event(), registrations: [person(9)] }); }
      }) as never);

      component.eventControl.setValue(1);
      component.eventControl.setValue(null);
      respond();
      expect(component.registrations).toEqual([]);
    });
  });

  describe('validaciones del formulario (mismas reglas que el backend)', () => {
    beforeEach(() => create());

    it('exige todos los campos', () => {
      expect(component.form.valid).toBeFalse();
      component.form.setValue(validForm);
      expect(component.form.valid).toBeTrue();
    });

    it('CC y TI solo aceptan números; los demás letras o números', () => {
      const number = component.form.controls.documentNumber;
      component.form.patchValue({ documentType: 'CC', documentNumber: 'AB12345' });
      expect(number.hasError('numericDocument')).toBeTrue();

      component.form.controls.documentType.setValue('PA');
      expect(number.valid).withContext('se revalida al cambiar el tipo').toBeTrue();

      component.form.patchValue({ documentType: 'TI', documentNumber: '1.037.654' });
      expect(number.valid).withContext('acepta puntos como separadores').toBeTrue();
    });

    it('valida nombres, correo y teléfono', () => {
      const c = component.form.controls;
      c.firstNames.setValue('Juan2');
      c.lastNames.setValue("D'Angelo Ñuñez");
      c.email.setValue('a@b.c');
      c.phone.setValue('(300) 123-4567');

      expect(c.firstNames.hasError('name')).toBeTrue();
      expect(c.lastNames.valid).toBeTrue();
      expect(c.email.hasError('email')).toBeTrue();
      expect(c.phone.valid).toBeTrue();

      c.phone.setValue('123');
      expect(c.phone.hasError('phone')).toBeTrue();
    });
  });

  describe('registrar asistencia con el formulario', () => {
    beforeEach(() => {
      create();
      component.eventControl.setValue(1);
    });

    it('no envía un formulario inválido y marca los errores', () => {
      component.submitForm();
      expect(service.register).not.toHaveBeenCalled();
      expect(component.form.controls.email.touched).toBeTrue();
    });

    it('registra la asistencia, agrega a la persona y limpia el formulario', () => {
      service.register.and.returnValue(of({
        registration: person(2, { firstNames: 'Santiago', lastNames: 'Ospina' }),
        event: event({ registeredCount: 2, availableSlots: 1 }),
        capacityReached: false, lastSlot: null
      }));
      component.form.setValue(validForm);
      component.submitForm();

      expect(service.register).toHaveBeenCalledWith(1, validForm);
      expect(component.registrations.length).toBe(2);
      expect(component.selectedEvent?.availableSlots).toBe(1);
      expect(component.form.controls.documentNumber.value).toBe('');
      expect(component.alertaResponse).toEqual(jasmine.objectContaining({ alertType: 'success' }));
      expect(component.working).toBeFalse();
    });

    it('avisa cuando la persona llenó el último cupo', () => {
      const slot = { ...validForm, position: 3, rowNumber: null };
      service.register.and.returnValue(of({
        registration: person(3), event: event({ registeredCount: 3, availableSlots: 0 }),
        capacityReached: true, lastSlot: slot
      }));
      component.form.setValue(validForm);
      component.submitForm();

      expect(component.lastSlot).toEqual(slot);
      expect(component.alertaResponse.alertTitle).toBe('Cupo completo');
    });

    it('muestra el mensaje del backend si falla', () => {
      service.register.and.returnValue(throwError(() => ({ error: { message: 'La asistencia ya está registrada.' } })));
      component.form.setValue(validForm);
      component.submitForm();

      expect(component.alertaResponse).toEqual(jasmine.objectContaining({ alertType: 'error', alertMessage: 'La asistencia ya está registrada.' }));
      expect(component.working).toBeFalse();
    });
  });

  describe('carga de Excel', () => {
    const input = (file?: File) => ({ files: file ? [file] : [], value: 'x' }) as unknown as HTMLInputElement;

    beforeEach(() => {
      create();
      component.eventControl.setValue(1);
    });

    it('rechaza archivos que no son .xlsx o que pasan de 5 MB', () => {
      component.onFileSelected(input(new File(['x'], 'datos.csv')));
      expect(component.fileError).toContain('.xlsx');

      const big = new File(['x'], 'grande.xlsx');
      Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 });
      component.onFileSelected(input(big));
      expect(component.fileError).toContain('5 MB');
      expect(component.selectedFile).toBeNull();
    });

    it('carga el archivo, refresca los asistentes y descarga el Excel de errores', () => {
      const result: ImportResult = {
        totalRows: 3, registered: 2, failed: 1, failedByCapacity: 0,
        event: event({ registeredCount: 3, availableSlots: 0 }), capacityReached: true,
        lastSlot: { ...validForm, position: 3, rowNumber: 4 },
        failedFile: { fileName: 'errores.xlsx', contentBase64: btoa('abc') }
      };
      service.importExcel.and.returnValue(of(result));
      const download = spyOn(component, 'downloadFailedFile');
      const field = input(new File(['x'], 'asistentes.xlsx'));

      component.onFileSelected(field);
      component.uploadExcel(field);

      expect(service.importExcel).toHaveBeenCalledWith(1, jasmine.any(File));
      expect(service.getByEvent).toHaveBeenCalledTimes(2);
      expect(download).toHaveBeenCalled();
      expect(component.lastSlot?.rowNumber).toBe(4);
      expect(component.alertaResponse.alertMessage).toContain('Se registró la asistencia de 2 de 3 personas');
      expect(component.alertaResponse.alertType).toBe('warning');
    });
  });

  describe('quitar asistencia', () => {
    beforeEach(() => {
      create();
      component.eventControl.setValue(1);
    });

    it('muestra el modal y no quita si se cierra', () => {
      component.remove(person(1));
      expect(component.showRemoveModal).toBeTrue();
      expect(component.registrationToRemove?.id).toBe(1);

      component.closeRemoveModal();

      expect(component.showRemoveModal).toBeFalse();
      expect(service.remove).not.toHaveBeenCalled();
    });

    it('confirma el retiro y vuelve a cargar los asistentes', () => {
      service.remove.and.returnValue(of(undefined));
      component.remove(person(1));
      component.confirmRemove();

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(component.showRemoveModal).toBeFalse();
      expect(service.getByEvent).toHaveBeenCalledTimes(2);
      expect(component.alertaResponse.alertTitle).toBe('Asistencia retirada');
    });
  });
});
