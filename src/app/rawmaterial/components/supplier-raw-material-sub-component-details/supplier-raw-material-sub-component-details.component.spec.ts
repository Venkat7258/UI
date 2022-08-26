import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRawMaterialSubComponentDetailsComponent } from './supplier-raw-material-sub-component-details.component';

describe('SupplierRawMaterialSubComponentDetailsComponent', () => {
  let component: SupplierRawMaterialSubComponentDetailsComponent;
  let fixture: ComponentFixture<SupplierRawMaterialSubComponentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRawMaterialSubComponentDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierRawMaterialSubComponentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
