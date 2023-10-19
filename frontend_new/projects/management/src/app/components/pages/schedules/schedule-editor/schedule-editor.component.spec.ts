import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleEditorComponent } from './schedule-editor.component';

describe('ScheduleEditorComponent', () => {
  let component: ScheduleEditorComponent;
  let fixture: ComponentFixture<ScheduleEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleEditorComponent]
    });
    fixture = TestBed.createComponent(ScheduleEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
