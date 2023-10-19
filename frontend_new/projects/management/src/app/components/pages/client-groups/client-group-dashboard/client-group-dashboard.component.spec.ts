import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientGroupDashboardComponent } from './client-group-dashboard.component';

describe('GroupScheduleDashboardComponent', () => {
  let component: ClientGroupDashboardComponent;
  let fixture: ComponentFixture<ClientGroupDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientGroupDashboardComponent]
    });
    fixture = TestBed.createComponent(ClientGroupDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
