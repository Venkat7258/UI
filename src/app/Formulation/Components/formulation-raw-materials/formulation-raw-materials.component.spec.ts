import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulationRawMaterialsComponent } from './formulation-raw-materials.component';

describe('FormulationRawMaterialsComponent', () => {
  let component: FormulationRawMaterialsComponent;
  let fixture: ComponentFixture<FormulationRawMaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulationRawMaterialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulationRawMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
