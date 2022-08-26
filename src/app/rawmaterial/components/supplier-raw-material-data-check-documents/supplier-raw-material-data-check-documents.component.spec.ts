import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRawMaterialDataCheckDocumentsComponent } from './supplier-raw-material-data-check-documents.component';

describe('SupplierRawMaterialDataCheckDocumentsComponent', () => {
  let component: SupplierRawMaterialDataCheckDocumentsComponent;
  let fixture: ComponentFixture<SupplierRawMaterialDataCheckDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRawMaterialDataCheckDocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierRawMaterialDataCheckDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
