import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTextareaInputComponent } from './custom-textarea-input.component';

describe('CustomTextareaInputComponent', () => {
  let component: CustomTextareaInputComponent;
  let fixture: ComponentFixture<CustomTextareaInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomTextareaInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomTextareaInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
