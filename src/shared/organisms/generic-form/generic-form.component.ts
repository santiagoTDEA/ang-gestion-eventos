import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-generic-form',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './generic-form.component.html',
  styleUrls: ['./generic-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericFormComponent {
  @Input() disabled = false;
  @Output() formSubmit = new EventEmitter<void>();

  handleSubmit(): void {
    if (this.disabled) return;
    this.formSubmit.emit();
  }
}