import { TestBed } from '@angular/core/testing';

import { ValidatorModulesService } from './validator-modules.service';

describe('ValidatorModulesService', () => {
  let service: ValidatorModulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidatorModulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
