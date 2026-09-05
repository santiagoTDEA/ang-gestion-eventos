import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Input } from '@angular/core';
@Component({
  selector: 'app-generic-button',
  imports: [CommonModule],
  templateUrl: './generic-button.component.html',
  styleUrl: './generic-button.component.css'
})
export class GenericButtonComponent {
  @Input() label: string = 'Ingresar';
  @Input() type: string = 'submit';
  @Input() customClass: string = 'w-full ';
  @Input() disabled: boolean = false;
  @Input() onClick!: () => void;
  @Input() customStyle: { [key: string]: string } = {};

  ejecutarClick() {
    if (this.onClick) {
      this.onClick();
    }
  }
}
