import { Component, input, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/** Paso 3 del formulario de eventos: apoyo logístico requerido. */
@Component({
  selector: 'app-event-logistica',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './event-logistica.component.html',
  host: { style: 'display: block' }
})
export class EventLogisticaComponent {
  readonly form = input.required<FormGroup>();
  readonly aspects = input<string[]>([]);

  readonly back = output<void>();
  readonly saveDraft = output<void>();
  readonly preview = output<void>();
  readonly next = output<void>();

  asControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }
}
