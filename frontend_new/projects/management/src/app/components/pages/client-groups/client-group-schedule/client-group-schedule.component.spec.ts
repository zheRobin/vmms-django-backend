import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientGroupScheduleComponent } from './client-group-schedule.component';

describe('GroupScheduleComponent', () => {
  let component: ClientGroupScheduleComponent;
  let fixture: ComponentFixture<ClientGroupScheduleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientGroupScheduleComponent]
    });
    fixture = TestBed.createComponent(ClientGroupScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
