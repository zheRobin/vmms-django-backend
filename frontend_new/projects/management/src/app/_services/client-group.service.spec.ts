import { TestBed } from '@angular/core/testing';

import { ClientGroupService } from './client-group.service';

describe('GroupScheduleService', () => {
  let service: ClientGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
