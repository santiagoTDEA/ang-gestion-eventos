import { TestBed } from '@angular/core/testing';

import { CredencialLoginService } from './credencial-login.service';

describe('CredencialLoginService', () => {
  let service: CredencialLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CredencialLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
