import { TestBed } from '@angular/core/testing';

import { StatusTypesService } from './status-types.service';

describe('StatusTypesService', () => {
  let service: StatusTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
