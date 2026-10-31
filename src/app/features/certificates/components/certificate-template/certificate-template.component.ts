import { Component, input } from '@angular/core';
import { CertificateData } from '../../interfaces/certificates.interfaces';

/**
 * Plantilla fija del certificado. El diseño no cambia: solo se reemplazan los
 * datos de la persona y del evento. Mide como una hoja A4 horizontal.
 */
@Component({
  selector: 'app-certificate-template',
  standalone: true,
  templateUrl: './certificate-template.component.html',
  styleUrl: './certificate-template.component.css'
})
export class CertificateTemplateComponent {
  readonly data = input.required<CertificateData>();
}
