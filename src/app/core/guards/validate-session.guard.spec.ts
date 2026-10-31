import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';

import { validateSessionGuard } from './validate-session.guard';

describe('validateSessionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => validateSessionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
    localStorage.clear();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('redirige al login cuando no existe token', () => {
    const route = { data: {} } as ActivatedRouteSnapshot;
    const state = { url: '/roles' } as RouterStateSnapshot;
    const result = executeGuard(route, state);
    expect(result).not.toBeTrue();
  });
});
