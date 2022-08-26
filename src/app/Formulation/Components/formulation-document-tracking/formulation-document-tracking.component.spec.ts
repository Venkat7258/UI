import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulationDocumentTrackingComponent } from './formulation-document-tracking.component';

describe('FormulationDocumentTrackingComponent', () => {
  let component: FormulationDocumentTrackingComponent;
  let fixture: ComponentFixture<FormulationDocumentTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulationDocumentTrackingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulationDocumentTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
