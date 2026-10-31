import { TestBed } from '@angular/core/testing';

import { ValidateRenderingService } from './validate-rendering.service';

describe('ValidateRenderingService', () => {
  let service: ValidateRenderingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidateRenderingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('retorna todos los módulos con permisos completos', () => {
    const modules = [{ value: 'roles', label: 'Roles', icono: 'key' }];
    const result = service.validateRendering({
      permissionsFull: true,
      modulesFull: true,
      accesos: []
    }, modules);
    expect(result).toEqual(modules);
  });

  it('filtra módulos según el campo module', () => {
    const modules = [
      { value: 'roles', label: 'Roles', icono: 'key' },
      { value: 'usuarios', label: 'Usuarios', icono: 'user' }
    ];
    const result = service.validateRendering({
      permissionsFull: false,
      modulesFull: false,
      accesos: [{ module: 'roles', acciones: ['leer'] }]
    }, modules);
    expect(result.map(module => module.value)).toEqual(['roles']);
  });
});
