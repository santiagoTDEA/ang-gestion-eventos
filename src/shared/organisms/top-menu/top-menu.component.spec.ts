import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TopMenuComponent } from './top-menu.component';
import { NotificationsService } from '../../../app/core/services/notifications.service';
import { CurrentUserService } from '../../../app/core/services/current-user.service';

describe('TopMenuComponent · título del módulo', () => {
  let component: TopMenuComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TopMenuComponent],
      providers: [
        provideRouter([]),
        { provide: NotificationsService, useValue: jasmine.createSpyObj('NotificationsService', ['getAll'], {}) },
        { provide: CurrentUserService, useValue: jasmine.createSpyObj('CurrentUserService', ['getProfile']) }
      ]
    });
    component = TestBed.createComponent(TopMenuComponent).componentInstance;
  });

  const titleFor = (url: string) => {
    component.routerUrl = url;
    return component.moduleTitle;
  };

  it('muestra Asistencia aunque la ruta siga siendo /inscripciones', () => {
    expect(titleFor('/inscripciones?evento=1')).toBe('Gestión de asistencia');
  });

  it('usa el nombre visible del módulo, con tildes', () => {
    expect(titleFor('/difusion')).toBe('Gestión de difusión');
    expect(titleFor('/eventos')).toBe('Gestión de eventos');
  });

  it('mantiene los títulos especiales', () => {
    expect(titleFor('/inicio')).toBe('Panel general');
    expect(titleFor('/')).toBe('Panel general');
    expect(titleFor('/mi-perfil')).toBe('Mi perfil');
  });

  it('si la ruta no es un módulo conocido usa la ruta', () => {
    expect(titleFor('/otra')).toBe('Gestión de otra');
  });
});
