import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
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

  @Input() optionValue: keyof T = 'value' as keyof T;
  @Input() optionLabel: keyof T = 'label' as keyof T;

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

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

  get selectedLabel(): string {
    const currentValue = this.control?.value;
    if (currentValue === null || currentValue === undefined) {
      return this.placeholder;
    }
    const match = this.options.find(opt => this.getValue(opt) === currentValue);
    return match ? this.getLabel(match) : this.placeholder;
  }

  get hasValue(): boolean {
    return this.control?.value !== null && this.control?.value !== undefined;
  }

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.handleBlur();
    }
  }

  selectOption(option: T): void {
    this.control.setValue(this.getValue(option));
    this.isOpen = false;
    this.handleBlur();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
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