import { TestBed } from '@angular/core/testing';

import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('concede acceso completo con módulos completos', () => {
    service.setRole({ modulesFull: true, permissionsFull: true, accesos: [] });
    expect(service.hasModule('roles')).toBeTrue();
    expect(service.hasPermission({ module: 'roles', action: 'crear' })).toBeTrue();
  });

  it('verifica acciones específicas por módulo', () => {
    service.setRole({
      modulesFull: false,
      permissionsFull: false,
      accesos: [{ module: 'roles', acciones: ['leer'] }]
    });
    expect(service.hasModule('roles')).toBeTrue();
    expect(service.hasPermission({ module: 'roles', action: 'leer' })).toBeTrue();
    expect(service.hasPermission({ module: 'roles', action: 'crear' })).toBeFalse();
  });

  it('limpia el rol almacenado', () => {
    service.setRole({ modulesFull: true, accesos: [] });
    service.clearRole();
    expect(service.hasModule('roles')).toBeFalse();
  });
});
