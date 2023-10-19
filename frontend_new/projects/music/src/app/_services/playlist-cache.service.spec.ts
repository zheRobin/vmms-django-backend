import { TestBed } from '@angular/core/testing';

import { PlaylistCacheService } from './playlist-cache.service';

describe('PlaylistCacheService', () => {
  let service: PlaylistCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaylistCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
