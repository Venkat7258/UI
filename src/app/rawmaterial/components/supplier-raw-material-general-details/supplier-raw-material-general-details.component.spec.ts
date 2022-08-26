import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRawMaterialGeneralDetailsComponent } from './supplier-raw-material-general-details.component';

describe('SupplierRawMaterialGeneralDetailsComponent', () => {
  let component: SupplierRawMaterialGeneralDetailsComponent;
  let fixture: ComponentFixture<SupplierRawMaterialGeneralDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRawMaterialGeneralDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierRawMaterialGeneralDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
