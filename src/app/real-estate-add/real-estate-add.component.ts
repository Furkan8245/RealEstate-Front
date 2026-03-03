import { Component } from '@angular/core';

@Component({
  selector: 'app-real-estate-add',
  standalone: true,
  imports: [],
  templateUrl: './real-estate-add.component.html',
  styleUrl: './real-estate-add.component.css'
})
export class RealEstateAddComponent {
  save(){
    this.addDto.cityId = this.selectedLocation.cityId;
  }
}
