import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
@Component({
  selector: 'app-generic-button',
  imports: [CommonModule],
  templateUrl: './generic-button.component.html',
  styleUrl: './generic-button.component.css'
})
export class GenericButtonComponent implements OnChanges {
  @Input() label: string = 'Ingresar';
  @Input() type: string = 'submit';
  @Input() customClass: string = 'w-full ';
  @Input() disabled: boolean = false;
  @Input() onClick!: () => void;
  @Input() customStyle: { [key: string]: string } = {};

  ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
    if (changes['disabled']) {
      const valorActual = changes['disabled'].currentValue;
      if (valorActual === true) {
        this.customClass = this.customClass.replace(' cursor-pointer', '');
      } else {
        if (!this.customClass.includes('cursor-pointer')) {
          this.customClass += ' cursor-pointer';
        }
      }
    }
  }

  ejecutarClick() {
    if (this.onClick) {
      this.onClick();
    }
  }
}
