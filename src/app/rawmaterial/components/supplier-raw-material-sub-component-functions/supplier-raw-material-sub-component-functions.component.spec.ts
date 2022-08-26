import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRawMaterialSubComponentFunctionsComponent } from './supplier-raw-material-sub-component-functions.component';

describe('SupplierRawMaterialSubComponentFunctionsComponent', () => {
  let component: SupplierRawMaterialSubComponentFunctionsComponent;
  let fixture: ComponentFixture<SupplierRawMaterialSubComponentFunctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRawMaterialSubComponentFunctionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierRawMaterialSubComponentFunctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
