import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

export type GenericInputIcon = 'user' | 'eye' | 'eye-off' | 'eye-slash' | 'none';

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
  @Input() errorMessage = 'Este campo es obligatorio';

  @Output() iconClick = new EventEmitter<void>();

  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl('');
    }
  }

  get showError(): boolean {
    return this.control.invalid && this.control.touched;
  }

  handleBlur(): void {
    this.control.markAsTouched();
  }

  handleIconClick(): void {
    this.iconClick.emit();
  }
}