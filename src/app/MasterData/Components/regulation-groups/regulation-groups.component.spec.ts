import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegulationGroupsComponent } from './regulation-groups.component';

describe('RegulationGroupsComponent', () => {
  let component: RegulationGroupsComponent;
  let fixture: ComponentFixture<RegulationGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegulationGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegulationGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
