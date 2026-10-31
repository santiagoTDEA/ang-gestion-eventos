import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GenericButtonComponent } from '../../../shared/atoms/generic-button/generic-button.component';
import { GenericFormComponent } from "../../../shared/organisms/generic-form/generic-form.component";
import { GenericInputComponent } from "../../../shared/atoms/generic-input/generic-input.component";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CredencialLoginService } from './services/credencial-login.service';
import { ChangePasswordCredentials, LoginCredentials } from './interfaces/login.interfaces';
import { GenericInputIcon } from '../../../shared/atoms/generic-input/generic-input.component';
import { GenericAlertResponse } from '../../../shared/atoms/generic-alert/utils/style';
import { GenericAlertComponent } from '../../../shared/atoms/generic-alert/generic-alert.component';
import { HttpErrorResponse } from '@angular/common/http';
import { JwtService } from '../../core/services/jwt.service';
@Component({
  selector: 'app-login',
  imports: [GenericButtonComponent, GenericFormComponent, GenericInputComponent, GenericAlertComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  iconoPassword: GenericInputIcon = 'eye-slash' as GenericInputIcon;
  alertaResponse: GenericAlertResponse = { alertVisible: false, alertType: 'success', alertTitle: '', alertMessage: '' };

  typePassword: 'text' | 'password' = 'password';
  loginForm: FormGroup;
  changePasswordForm: FormGroup;
  mode: 'login' | 'change-password' = 'login';
  loading = false;
  private readonly router: Router = inject(Router);
  private readonly jwtService = inject(JwtService);

  constructor(private fb: FormBuilder, private credencialLoginService: CredencialLoginService) {
    this.loginForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/^\S+$/),
        ],
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(/^\S+$/),
        ],
      ],
    });
    this.changePasswordForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^\S+$/)]],
      currentPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100), Validators.pattern(/^\S+$/)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  abrirCambioPassword(): void {
    this.mode = 'change-password';
    this.loading = false;
    this.changePasswordForm.reset();
    this.changePasswordForm.patchValue({ username: this.loginForm.get('username')?.value ?? '' });
    this.alertaResponse = { alertVisible: false, alertType: 'success', alertTitle: '', alertMessage: '' };
  }

  volverAlLogin(): void {
    this.mode = 'login';
    this.loading = false;
    this.alertaResponse = { alertVisible: false, alertType: 'success', alertTitle: '', alertMessage: '' };
  }

  onSubmit(formValue: any): void {
    if (this.loginForm.invalid || this.loading) return;
    this.postCredentials(formValue);

  }
  handleClick(): void {
    this.iconoPassword = (this.typePassword === 'password' ? 'eye' : 'eye-slash') as GenericInputIcon;
    this.typePassword = this.typePassword === 'password' ? 'text' : 'password';
  }


  async postCredentials(credentials: LoginCredentials) {
    this.loading = true;
    this.alertaResponse = {
      ...this.alertaResponse,
      alertVisible: false
    };

    try {
      const response = await this.credencialLoginService.postCredentials(credentials);
      if (response.accessToken) {
        if (!this.jwtService.esTokenValido(response.accessToken)) {
          this.mostrarError('El servidor respondió con una sesión inválida.');
          return;
        }

        this.alertaResponse = {
          alertVisible: true,
          alertType: 'success',
          alertTitle: 'Éxito',
          alertMessage: 'Inicio de sesión exitoso.'
        };
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('loggedInUsername', credentials.username.trim());
        this.router.navigate(['/inicio']);


      } else {
        this.alertaResponse = {
          alertVisible: true,
          alertType: 'error',
          alertTitle: 'Error',
          alertMessage: 'Credenciales incorrectas.'
        };
      }
    } catch (error) {
      this.mostrarError(this.obtenerMensajeError(error));
    } finally {
      this.loading = false;
    }
  }

  async postChangePassword(formValue: ChangePasswordCredentials & { confirmPassword: string }): Promise<void> {
    if (this.changePasswordForm.invalid || this.loading) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.alertaResponse = { ...this.alertaResponse, alertVisible: false };

    try {
      await this.credencialLoginService.changePassword({
        username: formValue.username.trim(),
        currentPassword: formValue.currentPassword,
        newPassword: formValue.newPassword
      });
      this.changePasswordForm.reset();
      this.alertaResponse = {
        alertVisible: true,
        alertType: 'success',
        alertTitle: 'Contraseña actualizada',
        alertMessage: 'La contraseña se cambió correctamente. Ya puedes iniciar sesión.'
      };
      this.loginForm.patchValue({
        username: formValue.username.trim(),
        password: ''
      });
      this.mode = 'login';
    } catch (error) {
      this.mostrarError(this.obtenerMensajeError(error));
    } finally {
      this.loading = false;
    }
  }

  private mostrarError(message: string): void {
    this.alertaResponse = {
      alertVisible: true,
      alertType: 'error',
      alertTitle: 'Error',
      alertMessage: message
    };
  }

  private obtenerMensajeError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      if (error instanceof Error && error.message.trim()) {
        return error.message;
      }
      return 'No se pudo iniciar sesión. Inténtalo nuevamente.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Usuario o contraseña incorrectos.';
    }

    if (error.status === 0) {
      return 'No hay conexión con el servidor.';
    }

    const responseMessage = (error.error as { message?: string } | null)?.message;
    return typeof responseMessage === 'string' && responseMessage.trim()
      ? responseMessage
      : 'No se pudo iniciar sesión. Inténtalo nuevamente.';
  }
}
