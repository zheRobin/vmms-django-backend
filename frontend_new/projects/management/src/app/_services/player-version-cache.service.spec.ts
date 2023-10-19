import { TestBed } from '@angular/core/testing';

import { PlayerVersionCacheService } from './player-version-cache.service';

describe('PlayerVersionCacheService', () => {
  let service: PlayerVersionCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerVersionCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
