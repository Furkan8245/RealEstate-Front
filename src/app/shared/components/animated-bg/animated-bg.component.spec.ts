import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedBgComponent } from './animated-bg.component';

describe('AnimatedBgComponent', () => {
  let component: AnimatedBgComponent;
  let fixture: ComponentFixture<AnimatedBgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedBgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnimatedBgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
