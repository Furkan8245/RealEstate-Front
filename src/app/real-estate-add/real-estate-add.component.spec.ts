import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealEstateAddComponent } from './real-estate-add.component';

describe('RealEstateAddComponent', () => {
  let component: RealEstateAddComponent;
  let fixture: ComponentFixture<RealEstateAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealEstateAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RealEstateAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
