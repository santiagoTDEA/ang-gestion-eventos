import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DiffusionService } from './services/diffusion.service';
import {
  DIFFUSION_ASSET_LABEL,
  DIFFUSION_STATUSES,
  DIFFUSION_TYPE_LABEL,
  DiffusionAction,
  DiffusionAsset,
  DiffusionAssetType,
  DiffusionRequest,
  DiffusionStatus
} from './interfaces/diffusion.interfaces';
import { ValidateRenderingService } from '../inicio/services/validate-rendering.service';
import { GenericAlertComponent } from '../../../shared/atoms/generic-alert/generic-alert.component';
import { GenericAlertResponse } from '../../../shared/atoms/generic-alert/utils/style';

@Component({
  selector: 'app-diffusion',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, GenericAlertComponent],
  templateUrl: './diffusion.component.html',
  styleUrl: './diffusion.component.css'
})
export class DiffusionComponent implements OnInit {
  private readonly diffusionService = inject(DiffusionService);
  private readonly validateRenderingService = inject(ValidateRenderingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly acceso = this.validateRenderingService.permisosDelModulo('difusion');
  readonly statuses = DIFFUSION_STATUSES;
  readonly typeLabel = DIFFUSION_TYPE_LABEL;
  readonly assetLabel = DIFFUSION_ASSET_LABEL;

  requests: DiffusionRequest[] = [];
  selectedId: number | null = null;
  loading = false;
  working = false;

  /** Pieza que se va a subir. */
  assetType = new FormControl<DiffusionAssetType | null>(null, Validators.required);
  selectedFile: File | null = null;

  /** Devolución con observación. */
  pendingAction: DiffusionAction | null = null;
  readonly noteControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]
  });

  alertaResponse: GenericAlertResponse = {
    alertVisible: false,
    alertType: 'success',
    alertTitle: '',
    alertMessage: ''
  };

  ngOnInit(): void {
    if (!this.acceso.canView) {
      this.router.navigate(['/inicio']);
      return;
    }

    this.loadRequests();
  }

  get selected(): DiffusionRequest | null {
    return this.requests.find(request => request.id === this.selectedId) ?? null;
  }

  get inProgress(): number {
    return this.requests.filter(request => request.status !== 'publicada').length;
  }

  get published(): number {
    return this.requests.filter(request => request.status === 'publicada').length;
  }

  statusLabel(status: DiffusionStatus): string {
    return this.statuses.find(item => item.value === status)?.label ?? status;
  }

  /** Posición del estado en el flujo, para marcar los pasos ya superados. */
  statusIndex(status: DiffusionStatus): number {
    return this.statuses.findIndex(item => item.value === status);
  }

  select(request: DiffusionRequest): void {
    this.selectedId = request.id;
    this.pendingAction = null;
    this.selectedFile = null;
    this.assetType.reset(request.allowedAssetTypes.length === 1 ? request.allowedAssetTypes[0] : null);
  }

  /** Ejecuta una acción del flujo; las devoluciones piden primero la observación. */
  runAction(action: DiffusionAction): void {
    if (action.requiresNote) {
      this.noteControl.reset('');
      this.pendingAction = action;
      return;
    }

    this.transition(action);
  }

  confirmNote(): void {
    if (!this.pendingAction) return;

    if (this.noteControl.invalid) {
      this.noteControl.markAsTouched();
      return;
    }

    this.transition(this.pendingAction, this.noteControl.value.trim());
  }

  cancelNote(): void {
    this.pendingAction = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  upload(): void {
    const request = this.selected;
    if (!request || !this.selectedFile || this.assetType.invalid || this.working) return;

    this.working = true;
    this.diffusionService.uploadAsset(request.id, this.assetType.value!, this.selectedFile).subscribe({
      next: updated => {
        this.replace(updated);
        this.selectedFile = null;
        this.working = false;
        this.showAlert('success', 'Pieza subida', 'La pieza quedó guardada en el repositorio de la solicitud.');
      },
      error: err => this.fail(err, 'No se pudo subir la pieza')
    });
  }

  removeAsset(asset: DiffusionAsset): void {
    const request = this.selected;
    if (!request || this.working) return;

    this.working = true;
    this.diffusionService.removeAsset(request.id, asset.id).subscribe({
      next: updated => {
        this.replace(updated);
        this.working = false;
      },
      error: err => this.fail(err, 'No se pudo quitar la pieza')
    });
  }

  fileUrl(asset: DiffusionAsset): string {
    return this.diffusionService.fileUrl(asset.path);
  }

  isImage(asset: DiffusionAsset): boolean {
    return asset.mimeType.startsWith('image/');
  }

  isVideo(asset: DiffusionAsset): boolean {
    return asset.mimeType.startsWith('video/');
  }

  formatSize(bytes: number): string {
    return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  goBack(): void {
    this.router.navigate(['/inicio']);
  }

  private transition(action: DiffusionAction, note?: string): void {
    const request = this.selected;
    if (!request || this.working) return;

    this.working = true;
    this.diffusionService.transition(request.id, action.to, note).subscribe({
      next: updated => {
        this.replace(updated);
        this.working = false;
        this.pendingAction = null;
        this.showAlert('success', 'Estado actualizado', `La solicitud pasó a «${this.statusLabel(updated.status)}».`);
      },
      error: err => this.fail(err, 'No se pudo cambiar el estado')
    });
  }

  private loadRequests(): void {
    this.loading = true;
    this.diffusionService.getRequests().subscribe({
      next: requests => {
        this.requests = requests;
        this.loading = false;

        const eventId = Number(this.route.snapshot.queryParamMap.get('evento'));
        const first = requests.find(request => request.eventId === eventId) ?? requests[0];
        if (first) this.select(first);
      },
      error: err => {
        this.loading = false;
        this.fail(err, 'No se pudieron cargar las solicitudes');
      }
    });
  }

  private replace(updated: DiffusionRequest): void {
    this.requests = this.requests.map(item => (item.id === updated.id ? updated : item));
  }

  private fail(err: { error?: { message?: string | string[] } }, title: string): void {
    this.working = false;
    const message = err?.error?.message;
    this.showAlert('error', title, Array.isArray(message) ? message.join(' ') : (message ?? 'Ocurrió un error inesperado.'));
  }

  private showAlert(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    this.alertaResponse = { alertVisible: true, alertType: type, alertTitle: title, alertMessage: message };
  }
}
