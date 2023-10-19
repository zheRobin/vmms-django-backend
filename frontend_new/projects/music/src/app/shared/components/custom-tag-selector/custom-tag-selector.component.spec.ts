import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTagSelectorComponent } from './custom-tag-selector.component';

describe('CustomTagSelectorComponent', () => {
  let component: CustomTagSelectorComponent;
  let fixture: ComponentFixture<CustomTagSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomTagSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomTagSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
