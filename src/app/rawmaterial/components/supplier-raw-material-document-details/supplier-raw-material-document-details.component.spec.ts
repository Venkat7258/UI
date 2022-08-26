import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRawMaterialDocumentDetailsComponent } from './supplier-raw-material-document-details.component';

describe('SupplierRawMaterialDocumentDetailsComponent', () => {
  let component: SupplierRawMaterialDocumentDetailsComponent;
  let fixture: ComponentFixture<SupplierRawMaterialDocumentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRawMaterialDocumentDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierRawMaterialDocumentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
