import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulationTranscriptSummaryComponent } from './formulation-transcript-summary.component';

describe('FormulationTranscriptSummaryComponent', () => {
  let component: FormulationTranscriptSummaryComponent;
  let fixture: ComponentFixture<FormulationTranscriptSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulationTranscriptSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulationTranscriptSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
