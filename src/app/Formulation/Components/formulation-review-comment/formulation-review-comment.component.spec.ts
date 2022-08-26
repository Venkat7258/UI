import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulationReviewCommentComponent } from './formulation-review-comment.component';

describe('FormulationReviewCommentComponent', () => {
  let component: FormulationReviewCommentComponent;
  let fixture: ComponentFixture<FormulationReviewCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulationReviewCommentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulationReviewCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
