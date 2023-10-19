import { TestBed } from '@angular/core/testing';

import { ClientCacheService } from './client-cache.service';

describe('ClientCacheService', () => {
  let service: ClientCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
