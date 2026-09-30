import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApprovalService } from './services/approval.service';
import { ApprovalFlow, ApprovalStep, ApprovalRole, Signature } from './interfaces/approval.interfaces';
import { GenericAlertComponent } from '../../../shared/atoms/generic-alert/generic-alert.component';
import { GenericAlertResponse } from '../../../shared/atoms/generic-alert/utils/style';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GenericAlertComponent,
  ],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.css'
})
export class ApprovalsComponent implements OnInit {

  private readonly approvalService = inject(ApprovalService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // Datos del flujo
  approvalFlow: ApprovalFlow | null = null;
  currentStep: ApprovalStep | null = null;
  loading = false;

  // Modales
  showSignatureModal = false;
  showRejectModal = false;
  showHistoryModal = false;

  // Formularios
  signatureForm!: FormGroup;
  rejectForm!: FormGroup;

  // Alertas
  alertaResponse: GenericAlertResponse = {
    alertVisible: false,
    alertType: 'success',
    alertTitle: '',
    alertMessage: ''
  };

  // Datos de prueba (eliminar cuando tengas el backend)
  mockFlow: ApprovalFlow = {
    id: '1',
    eventId: 'EVT-001',
    eventName: 'Diplomado en Analítica de Datos',
    currentStep: 0,
    steps: [
      {
        id: 'step-1',
        role: 'elaboracion',
        roleTitle: 'Responsable de Elaboración',
        roleDescription: 'Docente o persona encargada del diseño',
        status: 'pending',
        date: new Date().toISOString()
      },
      {
        id: 'step-2',
        role: 'revision',
        roleTitle: 'Responsable de Revisión',
        roleDescription: 'Enlace de Extensión, Director o Coordinador',
        status: 'pending'
      },
      {
        id: 'step-3',
        role: 'verificacion',
        roleTitle: 'Responsable de Verificación',
        roleDescription: 'Modalidad de Educación Continua',
        status: 'pending'
      },
      {
        id: 'step-4',
        role: 'validacion',
        roleTitle: 'Responsable de Validación',
        roleDescription: 'Director de Extensión Académica',
        status: 'pending'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  ngOnInit(): void {
    this.initForms();
    this.loadApprovalFlow();
  }

  private initForms(): void {
    // Formulario de firma híbrida
    this.signatureForm = this.fb.group({
      signatureType: ['text', Validators.required],
      signatureText: [''],
      signatureImage: [null],
      observations: ['']
    });

    // Formulario de rechazo
    this.rejectForm = this.fb.group({
      rejectionType: ['return', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private loadApprovalFlow(): void {
    this.loading = true;
    // Usar datos de prueba por ahora
    setTimeout(() => {
      this.approvalFlow = this.mockFlow;
      this.currentStep = this.approvalFlow.steps[this.approvalFlow.currentStep];
      this.loading = false;
    }, 500);

    // Cuando tengas el backend, descomenta esto:
    /*
    this.approvalService.getApprovalFlow('EVT-001').subscribe({
      next: (flow) => {
        this.approvalFlow = flow;
        this.currentStep = flow.steps[flow.currentStep];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.showAlert('error', 'Error', 'No se pudo cargar el flujo de aprobación');
      }
    });
    */
  }

  // Abrir modal de firma
  openSignatureModal(): void {
    this.showSignatureModal = true;
  }

  // Cerrar modal de firma
  closeSignatureModal(): void {
    this.showSignatureModal = false;
    this.signatureForm.reset({ signatureType: 'text' });
  }

  // Abrir modal de rechazo
  openRejectModal(): void {
    this.showRejectModal = true;
  }

  // Cerrar modal de rechazo
  closeRejectModal(): void {
    this.showRejectModal = false;
    this.rejectForm.reset({ rejectionType: 'return' });
  }

  // Abrir historial
  openHistoryModal(): void {
    this.showHistoryModal = true;
  }

  // Cerrar historial
  closeHistoryModal(): void {
    this.showHistoryModal = false;
  }

  // Manejar cambio en tipo de firma
  onSignatureTypeChange(): void {
    const type = this.signatureForm.get('signatureType')?.value;
    const textControl = this.signatureForm.get('signatureText');
    const imageControl = this.signatureForm.get('signatureImage');

    if (type === 'text') {
      imageControl?.clearValidators();
      textControl?.setValidators([Validators.required]);
    } else if (type === 'image') {
      textControl?.clearValidators();
      imageControl?.setValidators([Validators.required]);
    } else {
      textControl?.setValidators([Validators.required]);
      imageControl?.setValidators([Validators.required]);
    }

    textControl?.updateValueAndValidity();
    imageControl?.updateValueAndValidity();
  }

  // Manejar carga de imagen de firma
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.signatureForm.get('signatureImage')?.setValue(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  }

  // Enviar aprobación
  submitApproval(): void {
    if (this.signatureForm.invalid) {
      this.signatureForm.markAllAsTouched();
      return;
    }

    const formValue = this.signatureForm.value;
    const signature: Signature = {
      type: formValue.signatureType,
      text: formValue.signatureText,
      imageUrl: formValue.signatureImage
    };

    // Simulación de aprobación
    if (this.currentStep) {
      this.currentStep.status = 'approved';
      this.currentStep.approverName = 'Usuario Actual';
      this.currentStep.approverRole = this.currentStep.roleTitle;
      this.currentStep.date = new Date().toISOString();
      this.currentStep.signature = signature;
      this.currentStep.observations = formValue.observations;

      // Avanzar al siguiente paso
      if (this.approvalFlow && this.approvalFlow.currentStep < this.approvalFlow.steps.length - 1) {
        this.approvalFlow.currentStep++;
        this.currentStep = this.approvalFlow.steps[this.approvalFlow.currentStep];
        this.currentStep.status = 'in_progress';
      }
    }

    this.closeSignatureModal();
    this.showAlert('success', 'Aprobación exitosa', 'El paso ha sido aprobado correctamente');

    // Cuando tengas el backend, descomenta esto:
    /*
    this.approvalService.approveStep({
      stepId: this.currentStep!.id,
      signature,
      observations: formValue.observations
    }).subscribe({
      next: (response) => {
        this.closeSignatureModal();
        this.showAlert('success', 'Aprobación exitosa', response.message);
        this.loadApprovalFlow();
      },
      error: (err) => {
        console.error(err);
        this.showAlert('error', 'Error', 'No se pudo aprobar el paso');
      }
    });
    */
  }

  // Enviar rechazo
  submitRejection(): void {
    if (this.rejectForm.invalid) {
      this.rejectForm.markAllAsTouched();
      return;
    }

    const formValue = this.rejectForm.value;

    // Simulación de rechazo
    if (this.currentStep) {
      this.currentStep.status = 'rejected';
      this.currentStep.rejectionReason = formValue.reason;
      this.currentStep.rejectionType = formValue.rejectionType;

      if (formValue.rejectionType === 'return') {
        // Volver al paso anterior
        if (this.approvalFlow && this.approvalFlow.currentStep > 0) {
          this.approvalFlow.currentStep--;
          this.currentStep = this.approvalFlow.steps[this.approvalFlow.currentStep];
          this.currentStep.status = 'in_progress';
        }
      } else {
        // Rechazo completo - marcar todo como rechazado
        if (this.approvalFlow) {
          this.approvalFlow.steps.forEach(step => {
            if (step.status === 'pending' || step.status === 'in_progress') {
              step.status = 'rejected';
            }
          });
        }
      }
    }

    this.closeRejectModal();
    this.showAlert('warning', 'Rechazo registrado', 'El paso ha sido rechazado');

    // Cuando tengas el backend, descomenta esto:
    /*
    this.approvalService.rejectStep({
      stepId: this.currentStep!.id,
      rejectionType: formValue.rejectionType,
      reason: formValue.reason
    }).subscribe({
      next: (response) => {
        this.closeRejectModal();
        this.showAlert('warning', 'Rechazo registrado', response.message);
        this.loadApprovalFlow();
      },
      error: (err) => {
        console.error(err);
        this.showAlert('error', 'Error', 'No se pudo rechazar el paso');
      }
    });
    */
  }

  // Obtener color del estado
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '#94a3b8',
      in_progress: '#3b82f6',
      approved: '#22c55e',
      rejected: '#ef4444',
      returned: '#f59e0b'
    };
    return colors[status] || '#94a3b8';
  }

  // Obtener texto del estado
  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En progreso',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      returned: 'Devuelto'
    };
    return texts[status] || status;
  }

  // Mostrar alerta
  private showAlert(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    this.alertaResponse = {
      alertVisible: true,
      alertType: type,
      alertTitle: title,
      alertMessage: message
    };
  }

  // Volver al inicio
  goBack(): void {
    this.router.navigate(['/inicio']);
  }
}