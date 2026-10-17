import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericCheckboxComponent } from './generic-checkbox.component';

describe('GenericCheckboxComponent', () => {
  let component: GenericCheckboxComponent;
  let fixture: ComponentFixture<GenericCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericCheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
