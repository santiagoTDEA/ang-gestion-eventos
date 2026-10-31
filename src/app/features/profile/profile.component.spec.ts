import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { CurrentUserService } from '../../core/services/current-user.service';

describe('ProfileComponent', () => {
  let fixture: ComponentFixture<ProfileComponent>;
  let component: ProfileComponent;
  let service: jasmine.SpyObj<CurrentUserService>;

  const fill = (currentPassword: string, newPassword: string, confirmPassword: string) => {
    component.form.setValue({ currentPassword, newPassword, confirmPassword });
    component.form.markAllAsTouched();
    fixture.detectChanges();
  };
  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  beforeEach(() => {
    service = jasmine.createSpyObj<CurrentUserService>('CurrentUserService', ['getProfile', 'changePassword']);
    service.getProfile.and.returnValue(of({
      id: 'u1',
      username: 'santiago.ospina',
      name: 'Santiago Ospina',
      email: 'santiago@correo.com',
      role: { id: 'r1', name: 'Coordinador' }
    }));

    TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [provideRouter([]), { provide: CurrentUserService, useValue: service }]
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra los datos de la cuenta', () => {
    expect(text()).toContain('Santiago Ospina');
    expect(text()).toContain('santiago.ospina');
    expect(text()).toContain('Coordinador');
    expect(component.initials).toBe('SO');
  });

  it('marca los requisitos mientras se escribe la contraseña nueva', () => {
    fill('Actual123', 'abc', '');
    expect(component.rules.map(rule => component.ruleMet(rule))).toEqual([false, true, false, true]);

    fill('Actual123', 'Nueva2026', '');
    expect(component.rules.every(rule => component.ruleMet(rule))).toBeTrue();
  });

  it('no envía si la confirmación no coincide', () => {
    fill('Actual123', 'Nueva2026', 'Otra2026');
    component.submit();
    fixture.detectChanges();

    expect(service.changePassword).not.toHaveBeenCalled();
    expect(text()).toContain('No coincide con la contraseña nueva.');
  });

  it('no envía si la nueva es igual a la actual', () => {
    fill('Nueva2026', 'Nueva2026', 'Nueva2026');
    component.submit();
    fixture.detectChanges();

    expect(service.changePassword).not.toHaveBeenCalled();
    expect(text()).toContain('debe ser distinta de la actual');
  });

  it('no envía una contraseña débil', () => {
    fill('Actual123', 'soloLetras', 'soloLetras');
    component.submit();

    expect(service.changePassword).not.toHaveBeenCalled();
  });

  it('cambia la contraseña y limpia el formulario', () => {
    service.changePassword.and.returnValue(of({ message: 'La contraseña se actualizó correctamente.' }));
    fill('Actual123', 'Nueva2026', 'Nueva2026');
    component.submit();
    fixture.detectChanges();

    expect(service.changePassword).toHaveBeenCalledWith({
      currentPassword: 'Actual123',
      newPassword: 'Nueva2026',
      confirmPassword: 'Nueva2026'
    });
    expect(component.form.getRawValue()).toEqual({ currentPassword: '', newPassword: '', confirmPassword: '' });
    expect(component.alertaResponse.alertType).toBe('success');
  });

  it('si la actual es incorrecta marca ese campo y el error se quita al volver a escribir', () => {
    service.changePassword.and.returnValue(throwError(() => ({
      status: 400,
      error: { message: 'La contraseña actual no es correcta.' }
    })));
    fill('Equivocada1', 'Nueva2026', 'Nueva2026');
    component.submit();
    fixture.detectChanges();

    const current = component.form.controls.currentPassword;
    expect(current.hasError('incorrect')).toBeTrue();
    expect(text()).toContain('La contraseña actual no es correcta.');

    current.setValue('Actual123');
    expect(current.hasError('incorrect')).toBeFalse();
  });
});
