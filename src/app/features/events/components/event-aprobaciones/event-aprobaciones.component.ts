import { Component, input, output } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  /** Evento ya aprobado: responsables y firmas se muestran sin poder cambiarse. */
  readonly locked = input(false);

  readonly back = output<void>();
  readonly saveDraft = output<void>();
  readonly preview = output<void>();


  asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  /** Nombre de la persona elegida en un bloque, para la vista de solo lectura. */
  personLabel(index: number, control: AbstractControl): string {
    const value = String(this.asGroup(control).controls['name'].value ?? '');
    return this.options()[index]?.find(option => option.value === value)?.label ?? 'Sin asignar';
  }

}
