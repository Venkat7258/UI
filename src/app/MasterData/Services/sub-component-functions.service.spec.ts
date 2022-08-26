import { TestBed } from '@angular/core/testing';

import { SubComponentFunctionsService } from './sub-component-functions.service';

describe('SubComponentFunctionsService', () => {
  let service: SubComponentFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubComponentFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
