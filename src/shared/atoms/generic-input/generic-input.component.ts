import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

export type GenericInputIcon =
  | 'user'
  | 'eye'
  | 'eye-off'
  | 'eye-slash'
  | 'none';

@Component({
  selector: 'app-generic-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './generic-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericInputComponent implements OnInit {

  @Input() control!: AbstractControl;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'password' = 'text';
  @Input() icon: GenericInputIcon = 'none';

  @Output() iconClick = new EventEmitter<void>();

  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl('');
    }
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

    if (errors['minlength']) {
      return `Debe tener mínimo ${errors['minlength'].requiredLength} caracteres`;
    }

    if (errors['maxlength']) {
      return `Debe tener máximo ${errors['maxlength'].requiredLength} caracteres`;
    }

    if (errors['email']) {
      return 'Ingrese un correo electrónico válido';
    }

    if (errors['pattern']) {
      return 'El formato ingresado no es válido';
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

  handleIconClick(): void {
    this.iconClick.emit();
  }
}