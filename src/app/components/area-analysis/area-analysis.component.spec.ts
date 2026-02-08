import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaAnalysisComponent } from './area-analysis.component';

describe('AreaAnalysisComponent', () => {
  let component: AreaAnalysisComponent;
  let fixture: ComponentFixture<AreaAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AreaAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
