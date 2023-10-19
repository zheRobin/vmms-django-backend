import { TestBed } from '@angular/core/testing';

import { ProgramCacheService } from './program-cache.service';

describe('ProgramCacheService', () => {
  let service: ProgramCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgramCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
