import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerVersionEditorComponent } from './player-version-editor.component';

describe('PlayerVersiobEditorComponent', () => {
  let component: PlayerVersionEditorComponent;
  let fixture: ComponentFixture<PlayerVersionEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerVersionEditorComponent]
    });
    fixture = TestBed.createComponent(PlayerVersionEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
