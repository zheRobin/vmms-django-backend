import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerVersionsComponent } from './player-versions.component';

describe('PlayerVersionsComponent', () => {
  let component: PlayerVersionsComponent;
  let fixture: ComponentFixture<PlayerVersionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerVersionsComponent]
    });
    fixture = TestBed.createComponent(PlayerVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
