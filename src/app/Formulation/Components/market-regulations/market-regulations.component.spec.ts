import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketRegulationsComponent } from './market-regulations.component';

describe('MarketRegulationsComponent', () => {
  let component: MarketRegulationsComponent;
  let fixture: ComponentFixture<MarketRegulationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketRegulationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketRegulationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
