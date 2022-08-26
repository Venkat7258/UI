import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRawMaterialLandingComponent } from './supplier-raw-material-landing.component';

describe('SupplierRawMaterialLandingComponent', () => {
  let component: SupplierRawMaterialLandingComponent;
  let fixture: ComponentFixture<SupplierRawMaterialLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRawMaterialLandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierRawMaterialLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
