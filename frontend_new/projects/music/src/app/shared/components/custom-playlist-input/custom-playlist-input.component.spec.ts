import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPlaylistInputComponent } from './custom-playlist-input.component';

describe('CustomPlaylistInputComponent', () => {
  let component: CustomPlaylistInputComponent;
  let fixture: ComponentFixture<CustomPlaylistInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomPlaylistInputComponent]
    });
    fixture = TestBed.createComponent(CustomPlaylistInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
