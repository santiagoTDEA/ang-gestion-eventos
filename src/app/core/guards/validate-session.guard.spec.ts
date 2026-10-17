import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { validateSessionGuard } from './validate-session.guard';

describe('validateSessionGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => validateSessionGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
