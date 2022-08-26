import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRawMaterialDetailsComponent } from './supplier-raw-material-details.component';

describe('SupplierRawMaterialDetailsComponent', () => {
  let component: SupplierRawMaterialDetailsComponent;
  let fixture: ComponentFixture<SupplierRawMaterialDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRawMaterialDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierRawMaterialDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
