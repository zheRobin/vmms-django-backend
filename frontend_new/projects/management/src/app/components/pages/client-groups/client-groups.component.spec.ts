import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientGroupsComponent } from './client-groups.component';

describe('GroupSchedulesComponent', () => {
  let component: ClientGroupsComponent;
  let fixture: ComponentFixture<ClientGroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientGroupsComponent]
    });
    fixture = TestBed.createComponent(ClientGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
