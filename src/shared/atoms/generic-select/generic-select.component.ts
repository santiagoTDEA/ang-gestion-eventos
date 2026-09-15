import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-generic-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './generic-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericSelectComponent<T = any> implements OnInit {

  @Input() control!: AbstractControl;
  @Input() label = '';
  @Input() placeholder = 'Selecciona una opción';
  @Input() options: T[] = [];

  // nombres de las propiedades que se usarán como value/label
  @Input() optionValue: keyof T = 'value' as keyof T;
  @Input() optionLabel: keyof T = 'label' as keyof T;

  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl(null);
    }
  }

  getValue(option: T): any {
    return option[this.optionValue];
  }

  getLabel(option: T): string {
    return option[this.optionLabel] as unknown as string;
  }

  get showError(): boolean {
    return this.control.invalid && this.control.touched;
  }

  get errorMessage(): string {
    if (!this.control.errors) {
      return '';
    }

    const errors = this.control.errors;

    if (errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (errors['min']) {
      return `El valor mínimo es ${errors['min'].min}`;
    }

    if (errors['max']) {
      return `El valor máximo es ${errors['max'].max}`;
    }

    return 'El valor ingresado no es válido';
  }

  handleBlur(): void {
    this.control.markAsTouched();
  }
}