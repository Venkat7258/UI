import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegulationPropertiesComponent } from './regulation-properties.component';

describe('RegulationPropertiesComponent', () => {
  let component: RegulationPropertiesComponent;
  let fixture: ComponentFixture<RegulationPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegulationPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegulationPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
