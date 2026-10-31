import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountRecoveryService } from './services/account-recovery.service';
import {
  PASSWORD_RULES,
  PasswordRule,
  passwordConfirmationValidator,
  passwordPolicyValidator
} from '../../core/utils/password-rules';

/** Pasos del flujo: datos de la cuenta -> código del correo -> contraseña nueva -> listo. */
type Step = 'datos' | 'codigo' | 'clave' | 'listo';
type PasswordField = 'newPassword' | 'confirmPassword';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Recuperar cuenta. Pantalla pública: el login solo enlaza aquí. Si el usuario y
 * el correo coinciden, el backend envía un código al correo; con el código válido
 * la persona escribe su contraseña nueva, sin intervención de un administrador.
 */
@Component({
  selector: 'app-account-recovery',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './account-recovery.component.html',
  styleUrl: './account-recovery.component.css'
})
export class AccountRecoveryComponent implements OnDestroy {
  private readonly recoveryService = inject(AccountRecoveryService);
  private readonly fb = inject(FormBuilder);

  readonly rules = PASSWORD_RULES;

  step: Step = 'datos';
  loading = false;
  error = '';
  info = '';

  /** Segundos que faltan para poder reenviar el código y para que venza. */
  resendIn = 0;
  expiresIn = 0;
  private timer?: ReturnType<typeof setInterval>;
  private resetToken = '';

  visible: Record<PasswordField, boolean> = { newPassword: false, confirmPassword: false };

  readonly accountForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^\S+$/)]],
    email: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(EMAIL_PATTERN)]]
  });

  readonly codeForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  readonly passwordForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.maxLength(255), passwordPolicyValidator]],
    confirmPassword: ['', [Validators.required, Validators.maxLength(255)]]
  }, { validators: passwordConfirmationValidator });

  get maskedEmail(): string {
    const [name, domain] = this.accountForm.controls.email.value.trim().split('@');
    if (!domain) return '';
    return `${name.slice(0, 2)}${'•'.repeat(Math.max(1, name.length - 2))}@${domain}`;
  }

  get expiresLabel(): string {
    const minutes = Math.floor(this.expiresIn / 60);
    const seconds = String(this.expiresIn % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  get mismatch(): boolean {
    return this.passwordForm.hasError('mismatch') && this.passwordForm.controls.confirmPassword.touched;
  }

  showError(control: { touched: boolean; invalid: boolean }): boolean {
    return control.touched && control.invalid;
  }

  ruleMet(rule: PasswordRule): boolean {
    return rule.test(this.passwordForm.controls.newPassword.value);
  }

  toggleVisible(field: PasswordField): void {
    this.visible[field] = !this.visible[field];
  }

  /** Paso 1 (y "Reenviar código"): pide el código al correo registrado. */
  requestCode(): void {
    if (this.loading) return;
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    const { username, email } = this.accountForm.getRawValue();
    this.loading = true;
    this.error = '';

    this.recoveryService.request(username.trim(), email.trim()).subscribe({
      next: response => {
        this.loading = false;
        this.info = response.message;
        this.codeForm.reset();
        this.step = 'codigo';
        this.startTimers(response.resendInSeconds, response.expiresInMinutes * 60);
      },
      error: err => this.fail(err)
    });
  }

  /** Paso 2: valida el código y recibe el permiso para cambiar la contraseña. */
  verifyCode(): void {
    if (this.loading) return;
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.recoveryService.verify(this.accountForm.controls.username.value.trim(), this.codeForm.controls.code.value).subscribe({
      next: ({ resetToken }) => {
        this.loading = false;
        this.resetToken = resetToken;
        this.stopTimers();
        this.passwordForm.reset();
        this.step = 'clave';
      },
      error: err => {
        this.fail(err);
        this.codeForm.controls.code.reset();
      }
    });
  }

  /** Paso 3: guarda la contraseña nueva. */
  savePassword(): void {
    if (this.loading) return;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();
    this.loading = true;
    this.error = '';

    this.recoveryService.reset(this.resetToken, newPassword, confirmPassword).subscribe({
      next: ({ message }) => {
        this.loading = false;
        this.resetToken = '';
        this.info = message;
        this.passwordForm.reset();
        this.step = 'listo';
      },
      error: err => this.fail(err)
    });
  }

  /** Vuelve a los datos de la cuenta (p. ej. si se equivocó de correo). */
  changeAccount(): void {
    this.stopTimers();
    this.error = '';
    this.info = '';
    this.resetToken = '';
    this.step = 'datos';
  }

  ngOnDestroy(): void {
    this.stopTimers();
  }

  private startTimers(resendSeconds: number, expiresSeconds: number): void {
    this.stopTimers();
    this.resendIn = resendSeconds;
    this.expiresIn = expiresSeconds;

    this.timer = setInterval(() => {
      this.resendIn = Math.max(0, this.resendIn - 1);
      this.expiresIn = Math.max(0, this.expiresIn - 1);
      if (this.resendIn === 0 && this.expiresIn === 0) this.stopTimers();
    }, 1000);
  }

  private stopTimers(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  private fail(err: { status?: number; error?: { message?: string | string[] } }): void {
    this.loading = false;
    const message = err?.error?.message;

    this.error = err?.status === 429
      ? 'Hiciste demasiados intentos seguidos. Espera un minuto e inténtalo de nuevo.'
      : Array.isArray(message) ? message.join(' ') : (message ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.');
  }
}
