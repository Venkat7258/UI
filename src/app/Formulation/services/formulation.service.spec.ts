import { TestBed } from '@angular/core/testing';

import { FormulationService } from './formulation.service';

describe('FormulationService', () => {
  let service: FormulationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormulationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
