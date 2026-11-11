import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationsService } from './services/registrations.service';
import {
  DOCUMENT_TYPES,
  DocumentType,
  ImportResult,
  LastSlot,
  Registration,
  RegistrationData,
  RegistrationEvent
} from './interfaces/registrations.interfaces';
import { ValidateRenderingService } from '../inicio/services/validate-rendering.service';
import { GenericAlertComponent } from '../../../shared/atoms/generic-alert/generic-alert.component';
import { GenericAlertResponse } from '../../../shared/atoms/generic-alert/utils/style';

type Mode = 'formulario' | 'excel';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const NUMERIC_DOCUMENTS: DocumentType[] = ['CC', 'TI'];

/** Mismas reglas que valida el backend (y la plantilla de Excel). */
const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,100}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function nameValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').replace(/\s+/g, ' ').trim();
  return !value || NAME_PATTERN.test(value) ? null : { name: true };
}

function emailValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  return !value || (value.length <= 150 && EMAIL_PATTERN.test(value)) ? null : { email: true };
}

function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').replace(/[\s()-]/g, '');
  return !value || /^\+?\d{7,15}$/.test(value) ? null : { phone: true };
}

/** El número depende del tipo: CC y TI solo números; los demás, letras o números. */
function documentNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').replace(/[\s.-]/g, '');
  if (!value) return null;

  const type = control.parent?.get('documentType')?.value as DocumentType | null;
  return NUMERIC_DOCUMENTS.includes(type as DocumentType)
    ? (/^\d{5,12}$/.test(value) ? null : { numericDocument: true })
    : (/^[A-Za-z0-9]{5,15}$/.test(value) ? null : { alphanumericDocument: true });
}

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, GenericAlertComponent],
  templateUrl: './registrations.component.html',
  styleUrl: './registrations.component.css'
})
export class RegistrationsComponent implements OnInit {
  private readonly registrationsService = inject(RegistrationsService);
  private readonly validateRenderingService = inject(ValidateRenderingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly acceso = this.validateRenderingService.permisosDelModulo('asistencia');
  readonly documentTypes = DOCUMENT_TYPES;

  events: RegistrationEvent[] = [];
  registrations: Registration[] = [];
  registrationToRemove: Registration | null = null;
  showRemoveModal = false;
  readonly eventControl = new FormControl<number | null>(null);
  readonly searchControl = new FormControl('', { nonNullable: true });

  mode: Mode = 'formulario';
  /** Al entrar se ve la tabla de asistentes; el botón la cambia por el formulario y el Excel. */
  showForm = false;
  loadingEvents = false;
  loadingRegistrations = false;
  working = false;

  selectedFile: File | null = null;
  fileError = '';
  importResult: ImportResult | null = null;
  /** Persona que llenó el cupo en el último registro o carga. */
  lastSlot: LastSlot | null = null;

  readonly form = this.fb.nonNullable.group({
    documentType: this.fb.control<DocumentType | null>(null, Validators.required),
    documentNumber: ['', [Validators.required, documentNumberValidator]],
    firstNames: ['', [Validators.required, nameValidator]],
    lastNames: ['', [Validators.required, nameValidator]],
    email: ['', [Validators.required, emailValidator]],
    phone: ['', [Validators.required, phoneValidator]]
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

    // El número se vuelve a validar al cambiar el tipo de documento.
    this.form.controls.documentType.valueChanges.subscribe(() =>
      this.form.controls.documentNumber.updateValueAndValidity()
    );

    this.eventControl.valueChanges.subscribe(eventId => this.onEventChange(eventId));
    this.loadEvents();
  }

  get selectedEvent(): RegistrationEvent | null {
    return this.events.find(event => event.id === this.eventControl.value) ?? null;
  }

  get isFull(): boolean {
    const event = this.selectedEvent;
    return !!event && event.registeredCount >= event.maximumCapacity;
  }

  /** Porcentaje de cupos ocupados, para la barra. */
  get occupancy(): number {
    const event = this.selectedEvent;
    if (!event || event.maximumCapacity <= 0) return 0;
    return Math.min(100, Math.round((event.registeredCount / event.maximumCapacity) * 100));
  }

  get totalRegistered(): number {
    return this.events.reduce((total, event) => total + event.registeredCount, 0);
  }

  get filteredRegistrations(): Registration[] {
    const term = this.searchControl.value.trim().toLowerCase();
    if (!term) return this.registrations;

    return this.registrations.filter(item =>
      `${item.firstNames} ${item.lastNames} ${item.documentNumber} ${item.email}`.toLowerCase().includes(term)
    );
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  setMode(mode: Mode): void {
    this.mode = mode;
  }

  hasError(control: keyof typeof this.form.controls, error: string): boolean {
    const field = this.form.controls[control];
    return field.touched && field.hasError(error);
  }

  submitForm(): void {
    const event = this.selectedEvent;
    if (!event || this.working) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.working = true;
    this.registrationsService.register(event.id, this.form.getRawValue() as RegistrationData).subscribe({
      next: result => {
        this.working = false;
        this.updateEvent(result.event);
        this.registrations = [...this.registrations, result.registration];
        this.form.reset();

        const name = `${result.registration.firstNames} ${result.registration.lastNames}`;
        if (result.capacityReached && result.lastSlot) {
          this.lastSlot = result.lastSlot;
          this.showAlert('warning', 'Cupo completo',
            `${name} fue la persona #${result.lastSlot.position} y llenó el cupo del evento.`);
        } else {
          this.showAlert('success', 'Asistencia registrada',
            `La asistencia de ${name} quedó registrada. Quedan ${result.event.availableSlots} cupos.`);
        }
      },
      error: err => this.fail(err, 'No se pudo registrar la asistencia')
    });
  }

  onFileSelected(input: HTMLInputElement): void {
    const file = input.files?.[0] ?? null;
    this.importResult = null;
    this.fileError = '';
    this.selectedFile = null;

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      this.fileError = 'El archivo debe ser un Excel .xlsx.';
    } else if (file.size > MAX_FILE_BYTES) {
      this.fileError = 'El archivo supera el tamaño máximo de 5 MB.';
    } else {
      this.selectedFile = file;
    }

    if (!this.selectedFile) input.value = '';
  }

  uploadExcel(input: HTMLInputElement): void {
    const event = this.selectedEvent;
    if (!event || !this.selectedFile || this.working) return;

    this.working = true;
    this.registrationsService.importExcel(event.id, this.selectedFile).subscribe({
      next: result => {
        this.working = false;
        this.importResult = result;
        this.selectedFile = null;
        input.value = '';
        this.updateEvent(result.event);
        this.loadRegistrations(event.id);

        if (result.lastSlot) {
          this.lastSlot = result.lastSlot;
        }

        if (result.failedFile) {
          this.downloadFailedFile();
        }

        this.showAlert(
          result.failed > 0 ? 'warning' : 'success',
          'Carga terminada',
          `Se registró la asistencia de ${result.registered} de ${result.totalRows} personas.` +
          (result.failed > 0 ? ` ${result.failed} filas tienen error y se descargaron en un Excel para corregirlas.` : '')
        );
      },
      error: err => this.fail(err, 'No se pudo cargar el archivo')
    });
  }

  downloadFailedFile(): void {
    const file = this.importResult?.failedFile;
    if (!file) return;

    const bytes = Uint8Array.from(atob(file.contentBase64), char => char.charCodeAt(0));
    this.saveBlob(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), file.fileName);
  }

  downloadTemplate(): void {
    this.registrationsService.getTemplate().subscribe({
      next: blob => this.saveBlob(blob, 'plantilla-asistencia.xlsx'),
      error: err => this.fail(err, 'No se pudo descargar la plantilla')
    });
  }

  remove(registration: Registration): void {
    if (!this.selectedEvent || this.working) return;

    this.registrationToRemove = registration;
    this.showRemoveModal = true;
  }

  closeRemoveModal(): void {
    if (this.working) return;

    this.showRemoveModal = false;
    this.registrationToRemove = null;
  }

  confirmRemove(): void {
    const event = this.selectedEvent;
    const registration = this.registrationToRemove;
    if (!event || !registration || this.working) return;

    const name = `${registration.firstNames} ${registration.lastNames}`;

    this.working = true;
    this.registrationsService.remove(registration.id).subscribe({
      next: () => {
        this.working = false;
        this.closeRemoveModal();
        this.lastSlot = null;
        this.loadRegistrations(event.id);
        this.showAlert('success', 'Asistencia retirada', `Se retiró la asistencia de ${name} del evento.`);
      },
      error: err => {
        this.working = false;
        this.closeRemoveModal();
        this.fail(err, 'No se pudo retirar la asistencia');
      }
    });
  }

  documentLabel(type: DocumentType): string {
    return this.documentTypes.find(item => item.value === type)?.label ?? type;
  }

  goBack(): void {
    this.router.navigate(['/inicio']);
  }

  private onEventChange(eventId: number | null): void {
    this.showForm = false;
    this.registrations = [];
    this.importResult = null;
    this.lastSlot = null;
    this.selectedFile = null;
    this.fileError = '';
    this.searchControl.setValue('');
    this.form.reset();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { evento: eventId ?? null },
      replaceUrl: true
    });

    if (eventId) this.loadRegistrations(eventId);
  }

  private loadEvents(): void {
    this.loadingEvents = true;
    this.registrationsService.getEvents().subscribe({
      next: events => {
        this.events = events;
        this.loadingEvents = false;

        const eventId = Number(this.route.snapshot.queryParamMap.get('evento'));
        if (events.some(event => event.id === eventId)) {
          this.eventControl.setValue(eventId);
        }
      },
      error: err => {
        this.loadingEvents = false;
        this.fail(err, 'No se pudieron cargar los eventos');
      }
    });
  }

  private loadRegistrations(eventId: number): void {
    this.loadingRegistrations = true;
    this.registrationsService.getByEvent(eventId).subscribe({
      next: ({ event, registrations }) => {
        this.loadingRegistrations = false;
        // Si el usuario cambió de evento mientras cargaba, se descarta la respuesta.
        if (this.eventControl.value !== eventId) return;

        this.registrations = registrations;
        this.updateEvent(event);
      },
      error: err => {
        this.loadingRegistrations = false;
        this.fail(err, 'No se pudieron cargar los asistentes');
      }
    });
  }

  /** Actualiza la ocupación del evento en la lista sin volver a pedirla. */
  private updateEvent(updated: RegistrationEvent): void {
    this.events = this.events.map(event => (event.id === updated.id ? updated : event));
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private fail(err: { error?: { message?: string | string[] } }, title: string): void {
    this.working = false;
    const message = err?.error?.message;
    this.showAlert('error', title, Array.isArray(message) ? message.join(' ') : (message ?? 'Ocurrió un error inesperado.'));
  }

  private showAlert(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    this.alertaResponse = { alertVisible: true, alertType: type, alertTitle: title, alertMessage: message };
  }
}
