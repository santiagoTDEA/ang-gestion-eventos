import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-checkbox',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './generic-checkbox.component.html',
  styleUrl: './generic-checkbox.component.css'
})
export class GenericCheckboxComponent {


  @Input() control!: AbstractControl;
  @Input() label = '';

  ngOnInit(): void {
    if (!this.control) {
      this.control = new FormControl(false);
    }
  }
}
