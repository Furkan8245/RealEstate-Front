import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NominatimService } from '../../services/nominatim.service';

@Component({
  selector: 'app-edit-real-estate-modal',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './edit-real-estate-modal.component.html',
  styleUrl: './edit-real-estate-modal.component.css'
})
export class EditRealEstateModalComponent {
  constructor(
    private nominatimService:NominatimService
  ){}
  @Input() isOpen:boolean=false;
  @Input() dataEstate:any={};

  @Output() onSave = new EventEmitter<any>();
  @Output() onClose=new EventEmitter<any>();

  onAddressFieldsChange():void{
    const { cityName, districtName, neighborhoodName } = this.dataEstate;

  }

  save(){
    console.log("Kaydet butonuna basıldı, giden veri:", this.dataEstate);
    this.onSave.emit(this.dataEstate);
  }

  close(){
    console.log("Vazgeç butonuna basıldı");
    this.onClose.emit();
  }

}
