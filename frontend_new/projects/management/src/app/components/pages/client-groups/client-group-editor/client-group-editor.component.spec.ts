import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientGroupEditorComponent } from './client-group-editor.component';

describe('GroupeScheduleEditorComponent', () => {
  let component: ClientGroupEditorComponent;
  let fixture: ComponentFixture<ClientGroupEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientGroupEditorComponent]
    });
    fixture = TestBed.createComponent(ClientGroupEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
