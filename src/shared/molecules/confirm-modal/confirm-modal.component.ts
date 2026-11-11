import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

export type ConfirmModalVariant = 'danger' | 'primary';

let nextId = 0;

/**
 * Modal de confirmación reutilizable. Es solo presentación: el padre decide cuándo
 * está abierto (`open`) y qué hacer con `confirmed` / `cancelled`.
 * Se puede proyectar contenido extra entre las etiquetas del componente.
 */
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class ConfirmModalComponent {
  readonly open = input<boolean>(false);
  readonly title = input<string>('¿Estás seguro?');
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('Confirmar');
  readonly cancelLabel = input<string>('Cancelar');
  /** Texto del botón mientras se procesa la acción. */
  readonly loadingLabel = input<string>('Procesando…');
  readonly variant = input<ConfirmModalVariant>('danger');
  /** Bloquea los botones mientras el padre ejecuta la acción. */
  readonly loading = input<boolean>(false);
  /** Deshabilita solo "Confirmar", p. ej. mientras falta un dato del contenido proyectado. */
  readonly confirmDisabled = input<boolean>(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly titleId = `confirm-modal-title-${nextId++}`;
  protected readonly messageId = `${this.titleId}-message`;

  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  constructor() {
    // Al abrir, el foco va a "Cancelar" para que Enter no confirme por accidente.
    effect(() => {
      if (this.open()) this.cancelButton()?.nativeElement.focus();
    });
  }

  confirm(): void {
    if (!this.loading() && !this.confirmDisabled()) this.confirmed.emit();
  }

  cancel(): void {
    if (!this.loading()) this.cancelled.emit();
  }

  protected onEscape(): void {
    if (this.open()) this.cancel();
  }
}
