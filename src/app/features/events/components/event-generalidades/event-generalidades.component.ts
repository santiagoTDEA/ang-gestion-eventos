import { Component, input, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GenericInputComponent } from '../../../../../shared/atoms/generic-input/generic-input.component';
import { GenericSelectComponent } from '../../../../../shared/atoms/generic-select/generic-select.component';
import { ReturnFaculty } from '../../../faculty/interfaces/faculty.interfaces';

/** Paso 1 del formulario de eventos: generalidades. */
@Component({
  selector: 'app-event-generalidades',
  standalone: true,
  imports: [ReactiveFormsModule, GenericInputComponent, GenericSelectComponent],
  templateUrl: './event-generalidades.component.html',
  host: { style: 'display: block' }
})
export class EventGeneralidadesComponent {
  readonly form = input.required<FormGroup>();
  readonly faculties = input<ReturnFaculty[]>([]);
  readonly eventTypeOptions = input<{ value: string; label: string }[]>([]);
  readonly weekDays = input<string[]>([]);
  readonly modalities = input<string[]>([]);
  readonly draftSaved = input(false);
  /** Oculta las acciones mientras se imprime la vista previa. */
  readonly printing = input(false);

  readonly saveDraft = output<void>();
  readonly preview = output<void>();
  readonly next = output<void>();

  get eventTypeValue(): string {
    return this.form().get('eventType')?.value ?? '';
  }

  get selectedDays(): string[] {
    return this.form().get('selectedDays')?.value ?? [];
  }

  get selectedModality(): string {
    return this.form().get('selectedModality')?.value ?? '';
  }

  asControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

  toggleDay(day: string): void {
    const control = this.form().get('selectedDays')!;
    const current: string[] = control.value ?? [];
    const selected = !current.includes(day);
    control.setValue(selected ? [...current, day] : current.filter(d => d !== day));
    control.markAsTouched();

    // El horario del día solo existe (y se valida) mientras el día está seleccionado.
    const schedule = this.form().get(['schedules', day])!;
    if (selected) {
      schedule.enable();
    } else {
      schedule.reset({ startTime: '', endTime: '' });
      schedule.disable();
    }
  }

  /** Días seleccionados en el orden de la semana, para mostrar sus horarios. */
  get orderedSelectedDays(): string[] {
    return this.weekDays().filter(day => this.selectedDays.includes(day));
  }

  scheduleGroup(day: string): FormGroup {
    return this.form().get(['schedules', day]) as FormGroup;
  }

  toggleModality(modality: string): void {
    const control = this.form().get('selectedModality')!;
    control.setValue(control.value === modality ? '' : modality);
    control.markAsTouched();
  }
}
