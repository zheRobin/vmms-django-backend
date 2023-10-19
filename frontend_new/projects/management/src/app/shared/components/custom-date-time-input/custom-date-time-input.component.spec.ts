import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDateTimeInputComponent } from './custom-date-time-input.component';

describe('CustomDateTimeInputComponent', () => {
  let component: CustomDateTimeInputComponent;
  let fixture: ComponentFixture<CustomDateTimeInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomDateTimeInputComponent]
    });
    fixture = TestBed.createComponent(CustomDateTimeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
