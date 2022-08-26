import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDocumentCheckComponent } from './data-document-check.component';

describe('DataDocumentCheckComponent', () => {
  let component: DataDocumentCheckComponent;
  let fixture: ComponentFixture<DataDocumentCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataDocumentCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataDocumentCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
