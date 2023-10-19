import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomColorSelectorComponent } from './custom-color-selector.component';

describe('CustomColorSelectorComponent', () => {
  let component: CustomColorSelectorComponent;
  let fixture: ComponentFixture<CustomColorSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomColorSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomColorSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
