import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomGenreSelectorComponent } from './custom-genre-selector.component';

describe('CustomGenreSelectorComponent', () => {
  let component: CustomGenreSelectorComponent;
  let fixture: ComponentFixture<CustomGenreSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomGenreSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomGenreSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
