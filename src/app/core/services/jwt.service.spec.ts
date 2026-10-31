import { TestBed } from '@angular/core/testing';

import { JwtService } from './jwt.service';

describe('JwtService', () => {
  let service: JwtService;

  const crearToken = (payload: object): string => {
    const encode = (value: object) =>
      btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.signature`;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('rechaza un token sin fecha de expiración válida', () => {
    const token = crearToken({ sub: 'usuario-1', role: {} });
    expect(service.esTokenValido(token)).toBeFalse();
  });

  it('acepta un token vigente con rol válido', () => {
    const token = crearToken({
      sub: 'usuario-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
      role: {
        permissionsFull: false,
        modulesFull: false,
        accesos: [{ module: 'roles', acciones: ['leer'] }]
      }
    });
    expect(service.esTokenValido(token)).toBeTrue();
  });

  it('verifica acceso a un módulo por coincidencia exacta', () => {
    const token = crearToken({
      sub: 'usuario-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
      role: {
        permissionsFull: false,
        modulesFull: false,
        accesos: [{ module: 'roles', acciones: ['leer'] }]
      }
    });
    expect(service.tieneAccesoAlModulo(token, 'roles')).toBeTrue();
    expect(service.tieneAccesoAlModulo(token, 'usuarios')).toBeFalse();
  });
});
