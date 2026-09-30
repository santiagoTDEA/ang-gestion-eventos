import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { GenericAlertComponent } from '../../../shared/atoms/generic-alert/generic-alert.component';
import { GenericFormComponent } from '../../../shared/organisms/generic-form/generic-form.component';
import { GenericSelectComponent } from '../../../shared/atoms/generic-select/generic-select.component';
import { GenericInputComponent } from '../../../shared/atoms/generic-input/generic-input.component';
import { GenericButtonComponent } from '../../../shared/atoms/generic-button/generic-button.component';
import { CommonModule } from '@angular/common';
import { ReturnFaculty } from '../faculty/interfaces/faculty.interfaces';
import { FacultyService } from '../faculty/services/faculty.service';
import { RolesService } from '../roles/services/roles.service';
import { ReturnRole } from '../roles/interfaces/roles.interfaces';
import { Person } from '../peoples/interfaces/people.interfaces';
import { PeoplesService } from '../peoples/services/peoples.service';
 import { DOCUMENT } from '@angular/common';

const DRAFT_STORAGE_KEY = 'eventDraft';

interface ApprovalMeta {
  title: string;
  description: string;
  roleName: string;
}

type AlertType = 'success' | 'error' | 'info' | 'warning';

function minArrayLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!Array.isArray(value) || value.length < min) {
      return { minArrayLength: { requiredLength: min, actualLength: Array.isArray(value) ? value.length : 0 } };
    }
    return null;
  };
}

function minFormArrayLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const array = control as FormArray;
    if (!array || array.length < min) {
      return { minArrayLength: { requiredLength: min, actualLength: array ? array.length : 0 } };
    }
    return null;
  };
}

function validTimeRange(control: AbstractControl): ValidationErrors | null {
  const startTime = control.get('startTime')?.value;
  const endTime = control.get('endTime')?.value;

  if (!startTime || !endTime || endTime >= startTime) {
    return null;
  }

  return { endTimeBeforeStartTime: true };
}

function validDateRange(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (!startDate || !endDate || endDate >= startDate) {
    return null;
  }

  return { endDateBeforeStartDate: true };
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GenericAlertComponent,
    GenericFormComponent,
    GenericSelectComponent,
    GenericInputComponent,
    GenericButtonComponent,
    CommonModule
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly facultiesService = inject(FacultyService);
  private readonly roleServices: RolesService = inject(RolesService);
  private readonly peoplesService: PeoplesService = inject(PeoplesService);
  persons: { value: string; label: string }[] = [];
  approvalOptions: { value: string; label: string }[][] = [];
  activeStep = 0;
  draftSaved = false;
  previewVisible = false;
  reviewSent = false;
  loading = false;
  impirmir:boolean = false;
  readonly eventTypes = ['Curso', 'Diplomado', 'Seminario', '¿Otro?'];
  readonly eventTypeOptions = this.eventTypes.map(type => ({ value: type, label: type }));
  readonly weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly modalities = ['Presencial', 'Virtual', 'Mixta'];
  readonly logisticsOptions = [
    'Elaboración de piezas publicitarias',
    'Difusión',
    'Proceso de inscripción',
    'Transmisión (YouTube)',
    'Constancia de participación',
    '¿Otro?'
  ];
private readonly document = inject(DOCUMENT);

  facultyOptions: ReturnFaculty[] = [];

  readonly approvalsMeta: ApprovalMeta[] = [
    { title: 'Responsable de elaboración', description: 'Persona que diligenció el formato.', roleName: 'Elaboración' },
    { title: 'Responsable de revisión', description: 'Enlace de Extensión, director o coordinador de la dependencia.', roleName: 'Revisión' },
    { title: 'Responsable de verificación', description: 'Modalidad de Educación Continua.', roleName: 'Verificación' },
    { title: 'Responsable de validación', description: 'Dirección de Extensión Académica.', roleName: 'Validación' }
  ];

  readonly steps = [
    { number: '01', label: 'Generalidades', description: 'Información general del evento.' },
    { number: '02', label: 'Contenido', description: 'Define los objetivos y el contenido.' },
    { number: '03', label: 'Logística', description: 'Organiza fechas, lugar y recursos.' },
    { number: '04', label: 'Información financiera', description: 'Registra el presupuesto del evento.' },
    { number: '05', label: 'Aprobaciones', description: 'Revisa y envía el evento.' }
  ];
  viewRoles: ReturnRole[] = []
  alertaResponse: {
    alertVisible: boolean;
    alertType: AlertType;
    alertTitle: string;
    alertMessage: string;
  } = {
      alertVisible: false,
      alertType: 'success',
      alertTitle: '',
      alertMessage: ''
    };

  readonly eventForm: FormGroup;

  constructor() {
    this.eventForm = this.fb.group({
      generalidades: this.fb.group({
        eventType: ['', Validators.required],
        otherEventType: [''], // required condicional, ver watchOtherEventType()
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        faculty: ['', Validators.required],
        academicProgram: ['', Validators.required],
        teacherProfile: ['', Validators.required],
        duration: ['', [Validators.required, Validators.min(1)]],
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
        selectedDays: [[] as string[], minArrayLength(1)],
        selectedModality: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        minimumCapacity: ['', [Validators.required, Validators.min(1)]],
        maximumCapacity: ['', [Validators.required, Validators.min(1)]],
        participantProfile: ['', Validators.required]
      }, { validators: [validTimeRange, validDateRange] }),
      contenido: this.fb.group({
        presentation: ['', Validators.required],
        scope: ['', Validators.required],
        generalObjective: ['', Validators.required],
        objectives: this.fb.array(
          [this.createObjectiveControl(), this.createObjectiveControl(), this.createObjectiveControl()],
          minFormArrayLength(3)
        ),
        competencies: ['', Validators.required],
        modules: this.fb.array([] as FormControl[], minFormArrayLength(1))
      }),
      logistica: this.fb.group(
        this.logisticsOptions.reduce((group, aspect) => {
          group[aspect] = ['', Validators.required];
          return group;
        }, {} as Record<string, unknown[]>)
      ),
      financiera: this.fb.group({
        costPerParticipant: ['', [Validators.required, Validators.min(0)]],
        confirmedMinimumCapacity: ['', [Validators.required, Validators.min(1)]],
        financialObservations: ['', Validators.required]
      }),
      aprobaciones: this.fb.array(this.approvalsMeta.map(() => this.createApprovalGroup()))
    });

    this.watchOtherEventType();
    this.watchAutosave();
  }

  ngOnInit(): void {
    this.loadDraft();
    this.getFaculties();
    this.getRoles();
    this.getPersons();
  }

  // --- Getters de acceso rápido a los grupos/arreglos del formulario ---

  get generalidadesGroup(): FormGroup {
    return this.eventForm.get('generalidades') as FormGroup;
  }

  get contenidoGroup(): FormGroup {
    return this.eventForm.get('contenido') as FormGroup;
  }

  get logisticaGroup(): FormGroup {
    return this.eventForm.get('logistica') as FormGroup;
  }

  get financieraGroup(): FormGroup {
    return this.eventForm.get('financiera') as FormGroup;
  }

  get objectivesArray(): FormArray {
    return this.contenidoGroup.get('objectives') as FormArray;
  }

  get modulesArray(): FormArray {
    return this.contenidoGroup.get('modules') as FormArray;
  }

  get approvalsArray(): FormArray {
    return this.eventForm.get('aprobaciones') as FormArray;
  }

  get selectedDays(): string[] {
    return this.generalidadesGroup.get('selectedDays')?.value ?? [];
  }

  get selectedModality(): string {
    return this.generalidadesGroup.get('selectedModality')?.value ?? '';
  }

  get eventTypeValue(): string {
    return this.generalidadesGroup.get('eventType')?.value ?? '';
  }

  /** Casts helper para poder usar [formControl] en elementos nativos (textarea/checkbox/radio). */
  asControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

  asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  private createObjectiveControl(value = ''): FormControl {
    return this.fb.control(value, Validators.required);
  }

  private createModuleControl(value = ''): FormControl {
    return this.fb.control(value, Validators.required);
  }

  private createApprovalGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      date: ['', Validators.required],
      signature: ['', Validators.required]
    });
  }

  /** Normaliza texto para comparar sin importar mayúsculas ni tildes. */
  private normalize(value?: string): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }


  getPersons(): void {
    this.peoplesService.getPeoples().subscribe({
      next: (response: Person[]) => {
        this.persons = response.filter(person =>
          person.status?.statusName?.toLowerCase().trim() === 'activo'
        ).map(type => ({ value: type.id.toString(), label: `${type.email} - ${type.role?.name ?? ''}` }))

        // Opciones por bloque de aprobación (mismo orden que approvalsMeta)
        this.approvalOptions = this.approvalsMeta.map(meta =>
          response
            .filter(person =>
              person.status?.statusName?.toLowerCase().trim() === 'activo' &&
              this.normalize(person.role?.name) === this.normalize(meta.roleName)
            )
            .map(person => ({ value: person.id.toString(), label: `${person.email} - ${person.role?.name ?? ''}` }))
        );
      },
      error: (err) => console.error(err),
    });
  }
  getFaculties(): void {
    this.facultiesService.getFaculties().subscribe({
      next: (response: ReturnFaculty[]) => {

        this.facultyOptions = response;
      },
      error: (err) => console.error(err),
    });
  }


  asignarRoles(name: string): ReturnRole | undefined {
    return this.viewRoles.find(role => role.name === name);
  }

  getRoles(): void {
    this.roleServices.getRoles().subscribe({
      next: (roles) => {
        console.log(roles);
        this.viewRoles = roles;
      }
    });
  }

  /** otherEventType solo es obligatorio si eventType === '¿Otro?'. */
  private watchOtherEventType(): void {
    const eventTypeControl = this.generalidadesGroup.get('eventType')!;
    const otherEventTypeControl = this.generalidadesGroup.get('otherEventType')!;

    eventTypeControl.valueChanges.subscribe(type => {
      this.updateOtherEventTypeValidation(type, otherEventTypeControl);
    });
    this.updateOtherEventTypeValidation(eventTypeControl.value, otherEventTypeControl);
  }

  private updateOtherEventTypeValidation(type: string, control: AbstractControl): void {
    if (type === '¿Otro?') {
      control.setValidators(Validators.required);
    } else {
      control.clearValidators();
      control.setValue('', { emitEvent: false });
    }
    control.updateValueAndValidity({ emitEvent: false });
  }

  /** Criterio 1: autoguardado en localStorage ante cualquier cambio del formulario. */
  private watchAutosave(): void {
    this.eventForm.valueChanges.pipe(debounceTime(400)).subscribe(() => this.saveDraft());
  }

  /** Criterio 1: si existe un borrador guardado, se restaura al cargar el componente. */
  private loadDraft(): void {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const draft = JSON.parse(raw);

      const savedObjectives: string[] = draft?.contenido?.objectives ?? [];
      while (this.objectivesArray.length < Math.max(savedObjectives.length, 3)) {
        this.objectivesArray.push(this.createObjectiveControl());
      }

      const savedModules: string[] = draft?.contenido?.modules ?? [];
      while (this.modulesArray.length < savedModules.length) {
        this.modulesArray.push(this.createModuleControl());
      }

      this.eventForm.patchValue(draft, { emitEvent: false });
      this.updateOtherEventTypeValidation(this.eventTypeValue, this.generalidadesGroup.get('otherEventType')!);
    } catch {
      // Borrador corrupto o ilegible: se ignora y se continúa con los valores por defecto.
    }
  }

  saveDraft(): void {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(this.eventForm.getRawValue()));
    this.draftSaved = true;
  }

  selectStep(index: number): void {
    this.activeStep = index;
  }

  selectEventType(type: string): void {
    this.generalidadesGroup.get('eventType')!.setValue(type);
  }

  toggleDay(day: string): void {
    const control = this.generalidadesGroup.get('selectedDays')!;
    const current: string[] = control.value ?? [];
    control.setValue(current.includes(day) ? current.filter(d => d !== day) : [...current, day]);
    control.markAsTouched();
  }

  toggleModality(modality: string): void {
    const control = this.generalidadesGroup.get('selectedModality')!;
    control.setValue(control.value === modality ? '' : modality);
    control.markAsTouched();
  }

  private readonly stepGroups: Array<() => AbstractControl> = [
    () => this.generalidadesGroup,
    () => this.contenidoGroup,
    () => this.logisticaGroup,
    () => this.financieraGroup
  ];

  /** Avanza de paso solo si el paso actual es válido; si no, muestra los errores. */
  nextStep(): void {
    this.draftSaved = false;
    const currentGroup = this.stepGroups[this.activeStep]?.();

    if (currentGroup && currentGroup.invalid) {
      currentGroup.markAllAsTouched();
      return;
    }

    if (this.activeStep < this.steps.length - 1) {
      this.activeStep += 1;
    }
  }

  previousStep(): void {
    if (this.activeStep > 0) {
      this.activeStep -= 1;
    }
  }

  addObjective(): void {
    this.objectivesArray.push(this.createObjectiveControl());
  }

  removeObjective(index: number): void {
    if (this.objectivesArray.length > 1) {
      this.objectivesArray.removeAt(index);
    }
  }

  addModule(): void {
    this.modulesArray.push(this.createModuleControl());
  }

  removeModule(index: number): void {
    this.modulesArray.removeAt(index);
  }

  togglePreview(): void {
     this.impirmir=!this.impirmir;
    this.previewVisible = !this.previewVisible;
  }

  closePreview(): void {
    this.impirmir = false;
    this.previewVisible = false;
  }

 

printPreview(): void {
  this.document.defaultView?.print();
}


  clearSignature(index: number): void {
    this.approvalsArray.at(index).get('signature')!.setValue('');
  }

  /** Se mantiene por compatibilidad con el template: ahora delega en la validez del FormGroup. */
  get isFormComplete(): boolean {
    return this.eventForm.valid;
  }

  sendForReview(): void {
    const elaboracionRole = this.asignarRoles("Elaboración");
    if (!elaboracionRole) {
      this.alertaResponse = {
        alertVisible: true,
        alertType: 'error',
        alertTitle: 'Formulario incompleto',
        alertMessage: 'No se encontró el rol de Elaboración.'
      };
      return;
    }
    this.approvalsArray.at(0).get('role')?.setValue(elaboracionRole.id);


    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.alertaResponse = {
        alertVisible: true,
        alertType: 'error',
        alertTitle: 'Formulario incompleto',
        alertMessage: 'Completa todos los campos obligatorios de los 5 pasos antes de enviar.'
      };
      return;
    }

    console.log(this.eventForm.getRawValue());

    this.reviewSent = true;

    // Criterio 3: al enviar exitosamente se elimina el borrador guardado.
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    this.alertaResponse = {
      alertVisible: true,
      alertType: 'success',
      alertTitle: 'Formulario enviado',
      alertMessage: 'El formato fue enviado para revisión correctamente.'
    };
  }

  goBack(): void {
    this.router.navigate(['/inicio']);
  }
}