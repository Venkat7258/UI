import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionChangeDetailsComponent } from './version-change-details.component';

describe('VersionChangeDetailsComponent', () => {
  let component: VersionChangeDetailsComponent;
  let fixture: ComponentFixture<VersionChangeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VersionChangeDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionChangeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
