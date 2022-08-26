import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRawMaterialDataChecksComponent } from './supplier-raw-material-data-checks.component';

describe('SupplierRawMaterialDataChecksComponent', () => {
  let component: SupplierRawMaterialDataChecksComponent;
  let fixture: ComponentFixture<SupplierRawMaterialDataChecksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRawMaterialDataChecksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierRawMaterialDataChecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
