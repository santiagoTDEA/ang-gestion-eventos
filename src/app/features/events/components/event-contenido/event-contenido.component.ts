import { Component, inject, input, output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/** Paso 2 del formulario de eventos: contenido, objetivos y módulos. */
@Component({
  selector: 'app-event-contenido',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './event-contenido.component.html',
  host: { style: 'display: block' }
})
export class EventContenidoComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = input.required<FormGroup>();

  readonly back = output<void>();
  readonly saveDraft = output<void>();
  readonly preview = output<void>();
  readonly next = output<void>();

  get objectivesArray(): FormArray {
    return this.form().get('objectives') as FormArray;
  }

  get modulesArray(): FormArray {
    return this.form().get('modules') as FormArray;
  }

  asControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

  addObjective(): void {
    this.objectivesArray.push(this.fb.control('', Validators.required));
  }

  removeObjective(index: number): void {
    if (this.objectivesArray.length > 1) {
      this.objectivesArray.removeAt(index);
    }
  }

  addModule(): void {
    this.modulesArray.push(this.fb.control('', Validators.required));
  }

  removeModule(index: number): void {
    this.modulesArray.removeAt(index);
  }
}
