import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongsPreviewComponent } from './songs-preview.component';

describe('PlaylistPreviewComponent', () => {
  let component: SongsPreviewComponent;
  let fixture: ComponentFixture<SongsPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SongsPreviewComponent]
    });
    fixture = TestBed.createComponent(SongsPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
