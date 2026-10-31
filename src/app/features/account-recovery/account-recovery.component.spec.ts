import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AccountRecoveryComponent } from './account-recovery.component';
import { AccountRecoveryService } from './services/account-recovery.service';

describe('AccountRecoveryComponent', () => {
  let fixture: ComponentFixture<AccountRecoveryComponent>;
  let component: AccountRecoveryComponent;
  let service: jasmine.SpyObj<AccountRecoveryService>;

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const requested = { message: 'Si el usuario y el correo coinciden, te enviamos un código.', expiresInMinutes: 10, resendInSeconds: 60 };

  const goToCodeStep = () => {
    component.accountForm.setValue({ username: 'ana.ruiz', email: 'ana@correo.com' });
    component.requestCode();
    fixture.detectChanges();
  };

  beforeEach(() => {
    service = jasmine.createSpyObj<AccountRecoveryService>('AccountRecoveryService', ['request', 'verify', 'reset']);
    service.request.and.returnValue(of(requested));

    TestBed.configureTestingModule({
      imports: [AccountRecoveryComponent],
      providers: [provideRouter([]), { provide: AccountRecoveryService, useValue: service }]
    });

    fixture = TestBed.createComponent(AccountRecoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => component.ngOnDestroy());

  it('empieza pidiendo usuario y correo', () => {
    expect(component.step).toBe('datos');
    expect(text()).toContain('Correo registrado');
  });

  it('no pide el código si los datos no son válidos', () => {
    component.accountForm.setValue({ username: 'con espacio', email: 'no-es-correo' });
    component.requestCode();
    fixture.detectChanges();

    expect(service.request).not.toHaveBeenCalled();
    expect(text()).toContain('Escribe un correo válido.');
  });

  it('pide el código y pasa al paso 2 mostrando el correo enmascarado', () => {
    goToCodeStep();

    expect(service.request).toHaveBeenCalledWith('ana.ruiz', 'ana@correo.com');
    expect(component.step).toBe('codigo');
    expect(component.maskedEmail).toBe('an•@correo.com');
    expect(text()).toContain('vence en');
  });

  it('el botón de reenviar espera el minuto y el código muestra cuándo vence', fakeAsync(() => {
    goToCodeStep();
    expect(component.resendIn).toBe(60);
    expect(component.expiresLabel).toBe('10:00');

    tick(60_000);
    fixture.detectChanges();
    expect(component.resendIn).toBe(0);
    expect(component.expiresLabel).toBe('9:00');
    expect(text()).toContain('Reenviar código');

    discardPeriodicTasks();
  }));

  it('con el código correcto pasa a la contraseña nueva', () => {
    service.verify.and.returnValue(of({ resetToken: 'a'.repeat(64), expiresInMinutes: 15 }));
    goToCodeStep();

    component.codeForm.setValue({ code: '482913' });
    component.verifyCode();
    fixture.detectChanges();

    expect(service.verify).toHaveBeenCalledWith('ana.ruiz', '482913');
    expect(component.step).toBe('clave');
  });

  it('con un código incorrecto muestra los intentos que quedan y limpia el campo', () => {
    service.verify.and.returnValue(throwError(() => ({ status: 400, error: { message: 'El código no es correcto. Te quedan 4 intentos.' } })));
    goToCodeStep();

    component.codeForm.setValue({ code: '000000' });
    component.verifyCode();
    fixture.detectChanges();

    expect(component.step).toBe('codigo');
    expect(text()).toContain('Te quedan 4 intentos');
    expect(component.codeForm.controls.code.value).toBe('');
  });

  it('explica el límite cuando el servidor responde 429', () => {
    service.request.and.returnValue(throwError(() => ({ status: 429 })));
    component.accountForm.setValue({ username: 'ana.ruiz', email: 'ana@correo.com' });
    component.requestCode();
    fixture.detectChanges();

    expect(text()).toContain('Espera un minuto');
  });

  it('guarda la contraseña nueva con el permiso y termina', () => {
    service.verify.and.returnValue(of({ resetToken: 'b'.repeat(64), expiresInMinutes: 15 }));
    service.reset.and.returnValue(of({ message: 'Tu contraseña se actualizó. Ya puedes iniciar sesión.' }));
    goToCodeStep();
    component.codeForm.setValue({ code: '482913' });
    component.verifyCode();

    component.passwordForm.setValue({ newPassword: 'Nueva2026', confirmPassword: 'Nueva2026' });
    component.savePassword();
    fixture.detectChanges();

    expect(service.reset).toHaveBeenCalledWith('b'.repeat(64), 'Nueva2026', 'Nueva2026');
    expect(component.step).toBe('listo');
    expect(text()).toContain('Ir a iniciar sesión');
  });

  it('no envía una contraseña débil ni una confirmación distinta', () => {
    service.verify.and.returnValue(of({ resetToken: 'c'.repeat(64), expiresInMinutes: 15 }));
    goToCodeStep();
    component.codeForm.setValue({ code: '482913' });
    component.verifyCode();

    component.passwordForm.setValue({ newPassword: 'soloLetras', confirmPassword: 'soloLetras' });
    component.savePassword();
    component.passwordForm.setValue({ newPassword: 'Nueva2026', confirmPassword: 'Nueva2027' });
    component.savePassword();

    expect(service.reset).not.toHaveBeenCalled();
  });
});
