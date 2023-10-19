import { TestBed } from '@angular/core/testing';

import { ScheduleCacheService } from './schedule-cache.service';

describe('ScheduleCacheService', () => {
  let service: ScheduleCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScheduleCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
