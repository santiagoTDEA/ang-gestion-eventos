import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let fixture: ComponentFixture<ConfirmModalComponent>;
  let component: ConfirmModalComponent;
  let confirmed: jasmine.Spy;
  let cancelled: jasmine.Spy;

  const el = () => fixture.nativeElement as HTMLElement;
  const buttons = () => el().querySelectorAll<HTMLButtonElement>('.confirm-modal__btn');

  function render(inputs: Record<string, unknown> = {}): void {
    Object.entries({ open: true, ...inputs }).forEach(([key, value]) => fixture.componentRef.setInput(key, value));
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ConfirmModalComponent] });
    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    confirmed = jasmine.createSpy('confirmed');
    cancelled = jasmine.createSpy('cancelled');
    component.confirmed.subscribe(confirmed);
    component.cancelled.subscribe(cancelled);
  });

  it('no muestra nada cerrado', () => {
    render({ open: false });
    expect(el().querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('muestra título, mensaje y textos de los botones', () => {
    render({ title: 'Quitar', message: 'Se quitará', confirmLabel: 'Sí', cancelLabel: 'No' });

    expect(el().querySelector('h3')?.textContent).toContain('Quitar');
    expect(el().querySelector('p')?.textContent).toContain('Se quitará');
    expect(buttons()[0].textContent).toContain('No');
    expect(buttons()[1].textContent).toContain('Sí');
  });

  it('emite confirmed y cancelled', () => {
    render();
    buttons()[1].click();
    buttons()[0].click();

    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(cancelled).toHaveBeenCalledTimes(1);
  });

  it('cancela al hacer clic en el fondo o con Escape, pero no al hacer clic dentro', () => {
    render();
    (el().querySelector('[role="alertdialog"]') as HTMLElement).click();
    expect(cancelled).not.toHaveBeenCalled();

    (el().querySelector('.confirm-modal__fondo') as HTMLElement).click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(cancelled).toHaveBeenCalledTimes(2);
  });

  it('bloquea los botones mientras carga', () => {
    render({ loading: true, loadingLabel: 'Quitando…' });

    expect(buttons()[1].disabled).toBeTrue();
    expect(buttons()[1].textContent).toContain('Quitando…');
    component.cancel();
    component.confirm();
    expect(cancelled).not.toHaveBeenCalled();
    expect(confirmed).not.toHaveBeenCalled();
  });

  it('confirmDisabled bloquea solo el botón de confirmar', () => {
    render({ confirmDisabled: true });

    expect(buttons()[1].disabled).toBeTrue();
    expect(buttons()[0].disabled).toBeFalse();
    component.confirm();
    expect(confirmed).not.toHaveBeenCalled();
  });

  it('usa el estilo de peligro o primario según la variante', () => {
    render({ variant: 'danger' });
    expect(buttons()[1].classList).toContain('confirm-modal__btn--peligro');

    render({ variant: 'primary' });
    expect(buttons()[1].classList).toContain('confirm-modal__btn--primario');
  });
});
