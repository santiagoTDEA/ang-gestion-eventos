import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GenericButtonComponent } from '../../../shared/atoms/generic-button/generic-button.component';
import { GenericFormComponent } from "../../../shared/organisms/generic-form/generic-form.component";
import { GenericInputComponent } from "../../../shared/atoms/generic-input/generic-input.component";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CredencialLoginService } from './services/credencial-login.service';
import { LoginCredentials } from './interfaces/login.interfaces';
import { GenericInputIcon } from '../../../shared/atoms/generic-input/generic-input.component';
import { GenericAlertResponse } from '../../../shared/atoms/generic-alert/utils/style';
import { GenericAlertComponent } from '../../../shared/atoms/generic-alert/generic-alert.component';
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
  loading = false;
  private readonly router: Router = inject(Router);

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
  }

  onSubmit(formValue: any): void {
    if (this.loginForm.invalid) return;
    this.postCredentials(formValue);

  }
  handleClick(): void {
    this.iconoPassword = (this.typePassword === 'password' ? 'eye' : 'eye-slash') as GenericInputIcon;
    this.typePassword = this.typePassword === 'password' ? 'text' : 'password';
  }


  async postCredentials(credentials: LoginCredentials) {
    try {
      const response = await this.credencialLoginService.postCredentials(credentials);
      if (response.accessToken) {
        this.alertaResponse = {
          alertVisible: true,
          alertType: 'success',
          alertTitle: 'Éxito',
          alertMessage: 'Inicio de sesión exitoso.'
        };
        localStorage.setItem('accessToken', response.accessToken);
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
      this.alertaResponse = {
        alertVisible: true,
        alertType: 'error',
        alertTitle: 'Error',
        alertMessage: 'Error al iniciar sesión.'
      };
    }

  }
}
