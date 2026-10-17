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
});
