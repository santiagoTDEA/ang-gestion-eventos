import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Mismas reglas que valida el backend (auth/utils/password-policy.util.ts). */
export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordRule {
  key: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { key: 'length', label: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`, test: value => value.length >= PASSWORD_MIN_LENGTH },
  { key: 'letter', label: 'Al menos una letra', test: value => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(value) },
  { key: 'number', label: 'Al menos un número', test: value => /\d/.test(value) },
  { key: 'spaces', label: 'Sin espacios', test: value => value.length > 0 && !/\s/.test(value) }
];

/** Marca el control con { policy: [reglas que faltan] } si la contraseña no cumple. */
export function passwordPolicyValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '');
  if (!value) return null;

  const failed = PASSWORD_RULES.filter(rule => !rule.test(value)).map(rule => rule.key);
  return failed.length ? { policy: failed } : null;
}

/** En un grupo con newPassword y confirmPassword: { mismatch } si no coinciden. */
export function passwordConfirmationValidator(group: AbstractControl): ValidationErrors | null {
  const next = group.get('newPassword')?.value ?? '';
  const confirm = group.get('confirmPassword')?.value ?? '';
  return confirm && next !== confirm ? { mismatch: true } : null;
}
