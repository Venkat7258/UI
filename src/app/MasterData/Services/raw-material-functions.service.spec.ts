import { TestBed } from '@angular/core/testing';

import { RawMaterialFunctionsService } from './raw-material-functions.service';

describe('RawMaterialFunctionsService', () => {
  let service: RawMaterialFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RawMaterialFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
