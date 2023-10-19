import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkPreviewDashboardComponent } from './link-preview-dashboard.component';

describe('LinkPreviewDashboardComponent', () => {
  let component: LinkPreviewDashboardComponent;
  let fixture: ComponentFixture<LinkPreviewDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinkPreviewDashboardComponent]
    });
    fixture = TestBed.createComponent(LinkPreviewDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
