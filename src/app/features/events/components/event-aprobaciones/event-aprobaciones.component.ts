import { Component, input, output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GenericButtonComponent } from '../../../../../shared/atoms/generic-button/generic-button.component';
import { GenericInputComponent } from '../../../../../shared/atoms/generic-input/generic-input.component';
import { GenericSelectComponent } from '../../../../../shared/atoms/generic-select/generic-select.component';

export interface ApprovalMeta {
  title: string;
  description: string;
  roleName: string;
}

/** Paso 5 del formulario de eventos: cadena de aprobaciones y envío. */
@Component({
  selector: 'app-event-aprobaciones',
  standalone: true,
  imports: [ReactiveFormsModule, GenericInputComponent, GenericSelectComponent, GenericButtonComponent],
  templateUrl: './event-aprobaciones.component.html',
  host: { style: 'display: block' }
})
export class EventAprobacionesComponent {
  readonly form = input.required<FormArray>();
  readonly meta = input<ApprovalMeta[]>([]);
  readonly options = input<{ value: string; label: string }[][]>([]);
  readonly editing = input(false);
  readonly reviewSent = input(false);
  readonly loading = input(false);

  readonly back = output<void>();
  readonly saveDraft = output<void>();
  readonly preview = output<void>();

  asControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

  asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  clearSignature(index: number): void {
    this.form().at(index).get('signature')!.setValue('');
  }
}
