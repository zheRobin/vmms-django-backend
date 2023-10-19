import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomWorkingHoursInputComponent } from './custom-working-hours-input.component';

describe('CustomWorkingHoursInputComponent', () => {
  let component: CustomWorkingHoursInputComponent;
  let fixture: ComponentFixture<CustomWorkingHoursInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomWorkingHoursInputComponent]
    });
    fixture = TestBed.createComponent(CustomWorkingHoursInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
