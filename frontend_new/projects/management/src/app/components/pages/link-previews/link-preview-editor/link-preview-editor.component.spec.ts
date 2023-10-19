import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkPreviewEditorComponent } from './link-preview-editor.component';

describe('LinkPreviewEditorComponent', () => {
  let component: LinkPreviewEditorComponent;
  let fixture: ComponentFixture<LinkPreviewEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinkPreviewEditorComponent]
    });
    fixture = TestBed.createComponent(LinkPreviewEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
