import { Component } from '@angular/core';
import { GenericButtonComponent } from '../../../shared/atoms/generic-button/generic-button.component';
import { GenericFormComponent } from "../../../shared/organisms/generic-form/generic-form.component";
import { GenericInputComponent } from "../../../shared/atoms/generic-input/generic-input.component";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CredencialLoginService } from './services/credencial-login.service';
import { LoginCredentials } from './interfaces/login.interfaces';
import { GenericInputIcon } from '../../../shared/atoms/generic-input/generic-input.component';
@Component({
  selector: 'app-login',
  imports: [GenericButtonComponent, GenericFormComponent, GenericInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  iconoPassword: GenericInputIcon = 'eye-slash' as GenericInputIcon;
  typePassword: 'text' | 'password' = 'password';
  loginForm: FormGroup;
  loading = false;

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
    console.log(formValue);

  }
  handleClick(): void {
    this.iconoPassword = (this.typePassword === 'password' ? 'eye' : 'eye-slash') as GenericInputIcon;
    this.typePassword = this.typePassword === 'password' ? 'text' : 'password';
  }


  postCredentials(credentials: LoginCredentials) {
    return this.credencialLoginService.postCredentials(credentials).then(response => response);

  }
}
