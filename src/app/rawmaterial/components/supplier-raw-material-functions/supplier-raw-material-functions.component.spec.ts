import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRawMaterialFunctionsComponent } from './supplier-raw-material-functions.component';

describe('SupplierRawMaterialFunctionsComponent', () => {
  let component: SupplierRawMaterialFunctionsComponent;
  let fixture: ComponentFixture<SupplierRawMaterialFunctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRawMaterialFunctionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierRawMaterialFunctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
