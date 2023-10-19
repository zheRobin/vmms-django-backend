import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventEditorComponent } from './event-editor.component';

describe('EventEditorComponent', () => {
  let component: EventEditorComponent;
  let fixture: ComponentFixture<EventEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventEditorComponent]
    });
    fixture = TestBed.createComponent(EventEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
