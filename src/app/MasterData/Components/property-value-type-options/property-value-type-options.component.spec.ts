import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyValueTypeOptionsComponent } from './property-value-type-options.component';

describe('PropertyValueTypeOptionsComponent', () => {
  let component: PropertyValueTypeOptionsComponent;
  let fixture: ComponentFixture<PropertyValueTypeOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertyValueTypeOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyValueTypeOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
