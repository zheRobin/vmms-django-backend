import { TestBed } from '@angular/core/testing';

import { LinkPreviewCacheService } from './link-preview-cache.service';

describe('PreviewLinkServiceService', () => {
  let service: LinkPreviewCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinkPreviewCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
