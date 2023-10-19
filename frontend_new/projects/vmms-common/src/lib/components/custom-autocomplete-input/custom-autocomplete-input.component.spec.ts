import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAutocompleteInputComponent } from './custom-autocomplete-input.component';

describe('CustomAutocompleteInputComponent', () => {
  let component: CustomAutocompleteInputComponent;
  let fixture: ComponentFixture<CustomAutocompleteInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomAutocompleteInputComponent]
    });
    fixture = TestBed.createComponent(CustomAutocompleteInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
