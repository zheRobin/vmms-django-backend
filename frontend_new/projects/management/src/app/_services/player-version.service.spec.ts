import { TestBed } from '@angular/core/testing';

import { PlayerVersionService } from './player-version.service';

describe('PlayerVersionService', () => {
  let service: PlayerVersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerVersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
