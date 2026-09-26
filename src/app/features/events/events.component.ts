import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface EventForm {
  eventType: string;
  name: string;
  faculty: string;
  academicProgram: string;
  teacherProfile: string;
  duration: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  minimumCapacity: string;
  maximumCapacity: string;
  participantProfile: string;
}

interface Approval {
  title: string;
  description: string;
  name: string;
  role: string;
  date: string;
  signature: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent {
  private readonly router = inject(Router);
  activeStep = 0;
  draftSaved = false;
  previewVisible = false;
  otherEventType = '';

  readonly eventTypes = ['Curso', 'Diplomado', 'Seminario', '¿Otro?'];
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
  selectedDays: string[] = [];
  selectedModalities: string[] = [];
  logisticsAnswers: Record<string, string> = {};
  objectives = ['', '', ''];
  modules: string[] = [];
  contentForm = {
    presentation: '',
    scope: '',
    generalObjective: '',
    competencies: ''
  };
  financialForm = {
    costPerParticipant: '',
    confirmedMinimumCapacity: '',
    financialObservations: ''
  };
  reviewSent = false;
  approvals: Approval[] = [
    { title: 'Responsable de elaboración', description: 'Persona que diligenció el formato.', name: '', role: '', date: '', signature: '' },
    { title: 'Responsable de revisión', description: 'Enlace de Extensión, director o coordinador de la dependencia.', name: '', role: '', date: '', signature: '' },
    { title: 'Responsable de verificación', description: 'Modalidad de Educación Continua.', name: '', role: '', date: '', signature: '' },
    { title: 'Responsable de validación', description: 'Dirección de Extensión Académica.', name: '', role: '', date: '', signature: '' }
  ];
  form: EventForm = {
    eventType: '',
    name: '',
    faculty: '',
    academicProgram: '',
    teacherProfile: '',
    duration: '',
    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',
    minimumCapacity: '',
    maximumCapacity: '',
    participantProfile: ''
  };

  readonly steps = [
    { number: '01', label: 'Generalidades', description: 'Información general del evento.' },
    { number: '02', label: 'Contenido', description: 'Define los objetivos y el contenido.' },
    { number: '03', label: 'Logística', description: 'Organiza fechas, lugar y recursos.' },
    { number: '04', label: 'Información financiera', description: 'Registra el presupuesto del evento.' },
    { number: '05', label: 'Aprobaciones', description: 'Revisa y envía el evento.' }
  ];

  selectStep(index: number): void {
    this.activeStep = index;
  }

  selectEventType(type: string): void {
    this.form.eventType = type;
    if (type !== '¿Otro?') {
      this.otherEventType = '';
    }
  }

  toggleDay(day: string): void {
    this.selectedDays = this.selectedDays.includes(day)
      ? this.selectedDays.filter(selectedDay => selectedDay !== day)
      : [...this.selectedDays, day];
  }

  toggleModality(modality: string): void {
    this.selectedModalities = this.selectedModalities.includes(modality)
      ? this.selectedModalities.filter(selectedModality => selectedModality !== modality)
      : [...this.selectedModalities, modality];
  }

  saveDraft(): void {
    localStorage.setItem('eventDraft', JSON.stringify({
      form: this.form,
      otherEventType: this.otherEventType,
      selectedDays: this.selectedDays,
      selectedModalities: this.selectedModalities,
      objectives: this.objectives,
      modules: this.modules,
      contentForm: this.contentForm,
      logisticsAnswers: this.logisticsAnswers,
      financialForm: this.financialForm,
      approvals: this.approvals
    }));
    this.draftSaved = true;
  }

  nextStep(): void {
    this.draftSaved = false;
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
    this.objectives = [...this.objectives, ''];
  }

  removeObjective(index: number): void {
    if (this.objectives.length > 1) {
      this.objectives = this.objectives.filter((_, objectiveIndex) => objectiveIndex !== index);
    }
  }

  addModule(): void {
    this.modules = [...this.modules, ''];
  }

  removeModule(index: number): void {
    this.modules = this.modules.filter((_, moduleIndex) => moduleIndex !== index);
  }

  togglePreview(): void {
    this.previewVisible = !this.previewVisible;
  }

  closePreview(): void {
    this.previewVisible = false;
  }

  printPreview(): void {
    window.print();
  }

  sendForReview(): void {
    this.saveDraft();
    this.reviewSent = true;
  }

  goBack(): void {
    this.router.navigate(['/inicio']);
  }
}