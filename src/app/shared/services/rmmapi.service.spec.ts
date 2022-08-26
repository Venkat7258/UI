import { TestBed } from '@angular/core/testing';

import { RMMApiService } from './rmmapi.service';

describe('RMMApiService', () => {
  let service: RMMApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RMMApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
