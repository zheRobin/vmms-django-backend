import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramEditorComponent } from './program-editor.component';

describe('ProgramEditorComponent', () => {
  let component: ProgramEditorComponent;
  let fixture: ComponentFixture<ProgramEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProgramEditorComponent]
    });
    fixture = TestBed.createComponent(ProgramEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
