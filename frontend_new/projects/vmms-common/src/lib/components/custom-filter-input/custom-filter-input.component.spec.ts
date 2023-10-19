import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFilterInputComponent } from './custom-filter-input.component';

describe('CustomFilterInputComponent', () => {
  let component: CustomFilterInputComponent;
  let fixture: ComponentFixture<CustomFilterInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomFilterInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomFilterInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
