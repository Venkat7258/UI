import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulationINCIBreakdownListComponent } from './formulation-incibreakdown-list.component';

describe('FormulationINCIBreakdownListComponent', () => {
  let component: FormulationINCIBreakdownListComponent;
  let fixture: ComponentFixture<FormulationINCIBreakdownListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulationINCIBreakdownListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulationINCIBreakdownListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
