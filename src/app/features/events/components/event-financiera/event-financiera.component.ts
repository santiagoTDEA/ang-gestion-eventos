import { Component, input, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GenericInputComponent } from '../../../../../shared/atoms/generic-input/generic-input.component';

/** Paso 4 del formulario de eventos: información financiera. */
@Component({
  selector: 'app-event-financiera',
  standalone: true,
  imports: [ReactiveFormsModule, GenericInputComponent],
  templateUrl: './event-financiera.component.html',
  host: { style: 'display: block' }
})
export class EventFinancieraComponent {
  readonly form = input.required<FormGroup>();

  readonly back = output<void>();
  readonly saveDraft = output<void>();
  readonly preview = output<void>();
  readonly next = output<void>();

  asControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }
}
