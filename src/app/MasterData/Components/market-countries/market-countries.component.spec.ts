import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketCountriesComponent } from './market-countries.component';

describe('MarketCountriesComponent', () => {
  let component: MarketCountriesComponent;
  let fixture: ComponentFixture<MarketCountriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketCountriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketCountriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
