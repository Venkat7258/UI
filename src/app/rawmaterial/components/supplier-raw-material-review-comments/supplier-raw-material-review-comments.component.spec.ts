import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRawMaterialReviewCommentsComponent } from './supplier-raw-material-review-comments.component';

describe('SupplierRawMaterialReviewCommentsComponent', () => {
  let component: SupplierRawMaterialReviewCommentsComponent;
  let fixture: ComponentFixture<SupplierRawMaterialReviewCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierRawMaterialReviewCommentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierRawMaterialReviewCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
