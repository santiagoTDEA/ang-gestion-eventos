import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { CurrentUserService, UserProfile } from '../../core/services/current-user.service';
import {
  PASSWORD_RULES,
  PasswordRule,
  passwordConfirmationValidator,
  passwordPolicyValidator
} from '../../core/utils/password-rules';
import { GenericAlertComponent } from '../../../shared/atoms/generic-alert/generic-alert.component';
import { GenericAlertResponse } from '../../../shared/atoms/generic-alert/utils/style';

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

/** La confirmación coincide y la contraseña nueva es distinta de la actual. */
function passwordsValidator(group: AbstractControl): ValidationErrors | null {
  const current = group.get('currentPassword')?.value ?? '';
  const next = group.get('newPassword')?.value ?? '';
  const errors: ValidationErrors = { ...(passwordConfirmationValidator(group) ?? {}) };

  if (next && current && next === current) errors['sameAsCurrent'] = true;

  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, GenericAlertComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly rules = PASSWORD_RULES;

  profile: UserProfile | null = null;
  loadingProfile = false;
  saving = false;
  /** Campos con la contraseña visible (el ojo). */
  visible: Record<PasswordField, boolean> = { currentPassword: false, newPassword: false, confirmPassword: false };

  readonly form = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.maxLength(255)]],
    newPassword: ['', [Validators.required, Validators.maxLength(255), passwordPolicyValidator]],
    confirmPassword: ['', [Validators.required, Validators.maxLength(255)]]
  }, { validators: passwordsValidator });

  alertaResponse: GenericAlertResponse = {
    alertVisible: false,
    alertType: 'success',
    alertTitle: '',
    alertMessage: ''
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  get newPassword(): string {
    return this.form.controls.newPassword.value;
  }

  /** Iniciales para el avatar de la tarjeta. */
  get initials(): string {
    const words = (this.profile?.name || this.profile?.username || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2)).toUpperCase();
  }

  ruleMet(rule: PasswordRule): boolean {
    return rule.test(this.newPassword);
  }

  toggleVisible(field: PasswordField): void {
    this.visible[field] = !this.visible[field];
  }

  showError(field: PasswordField): boolean {
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }

  get mismatch(): boolean {
    return this.form.hasError('mismatch') && this.form.controls.confirmPassword.touched;
  }

  get sameAsCurrent(): boolean {
    return this.form.hasError('sameAsCurrent') && this.form.controls.newPassword.touched;
  }

  submit(): void {
    if (this.saving) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.currentUserService.changePassword(this.form.getRawValue()).subscribe({
      next: ({ message }) => {
        this.saving = false;
        this.form.reset();
        this.visible = { currentPassword: false, newPassword: false, confirmPassword: false };
        this.showAlert('success', 'Contraseña actualizada', `${message} Úsala la próxima vez que inicies sesión.`);
      },
      error: err => {
        this.saving = false;
        const message = this.errorMessage(err);

        // Se marca el campo; Angular quita el error solo cuando la persona vuelve a escribir.
        if (/actual no es correcta/i.test(message)) {
          const control = this.form.controls.currentPassword;
          control.setErrors({ incorrect: true });
          control.markAsTouched();
        }

        this.showAlert('error', 'No se pudo cambiar la contraseña', message);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/inicio']);
  }

  private loadProfile(): void {
    this.loadingProfile = true;
    this.currentUserService.getProfile().subscribe({
      next: profile => {
        this.profile = profile;
        this.loadingProfile = false;
      },
      error: err => {
        this.loadingProfile = false;
        this.showAlert('error', 'No se pudo cargar tu perfil', this.errorMessage(err));
      }
    });
  }

  private errorMessage(err: { error?: { message?: string | string[] } }): string {
    const message = err?.error?.message;
    return Array.isArray(message) ? message.join(' ') : (message ?? 'Ocurrió un error inesperado.');
  }

  private showAlert(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    this.alertaResponse = { alertVisible: true, alertType: type, alertTitle: title, alertMessage: message };
  }
}
