import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRealEstateModalComponent } from './edit-real-estate-modal.component';

describe('EditRealEstateModalComponent', () => {
  let component: EditRealEstateModalComponent;
  let fixture: ComponentFixture<EditRealEstateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRealEstateModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditRealEstateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
