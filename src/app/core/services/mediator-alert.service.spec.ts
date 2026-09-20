import { TestBed } from '@angular/core/testing';

import { MediatorAlertService } from './mediator-alert.service';

describe('MediatorAlertService', () => {
  let service: MediatorAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediatorAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
