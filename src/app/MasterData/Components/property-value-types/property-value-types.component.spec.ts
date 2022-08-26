import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyValueTypesComponent } from './property-value-types.component';

describe('PropertyValueTypesComponent', () => {
  let component: PropertyValueTypesComponent;
  let fixture: ComponentFixture<PropertyValueTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertyValueTypesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyValueTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
