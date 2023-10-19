import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientEditorComponent } from './client-editor.component';

describe('ClientEditorComponent', () => {
  let component: ClientEditorComponent;
  let fixture: ComponentFixture<ClientEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientEditorComponent]
    });
    fixture = TestBed.createComponent(ClientEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
