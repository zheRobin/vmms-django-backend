import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkPreviewsComponent } from './link-previews.component';

describe('LinkPreviewsComponent', () => {
  let component: LinkPreviewsComponent;
  let fixture: ComponentFixture<LinkPreviewsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinkPreviewsComponent]
    });
    fixture = TestBed.createComponent(LinkPreviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
