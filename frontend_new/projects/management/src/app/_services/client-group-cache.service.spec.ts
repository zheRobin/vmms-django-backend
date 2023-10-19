import { TestBed } from '@angular/core/testing';

import { ClientGroupCacheService } from './client-group-cache.service';

describe('GroupScheduleCacheService', () => {
  let service: ClientGroupCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientGroupCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
