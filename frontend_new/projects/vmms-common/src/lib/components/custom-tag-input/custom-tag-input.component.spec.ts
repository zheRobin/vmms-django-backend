import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTagInputComponent } from './custom-tag-input.component';

describe('CustomTagInputComponent', () => {
  let component: CustomTagInputComponent;
  let fixture: ComponentFixture<CustomTagInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomTagInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomTagInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
