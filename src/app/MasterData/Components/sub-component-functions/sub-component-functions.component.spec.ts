import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubComponentFunctionsComponent } from './sub-component-functions.component';

describe('SubComponentFunctionsComponent', () => {
  let component: SubComponentFunctionsComponent;
  let fixture: ComponentFixture<SubComponentFunctionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubComponentFunctionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubComponentFunctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
