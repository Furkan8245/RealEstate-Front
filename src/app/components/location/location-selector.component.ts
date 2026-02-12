import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RealEstateService } from '../../services/real-estate.service';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.css']
})
export class LocationSelectorComponent implements OnInit {
  cities: any[] = [];
  allDistricts: any[] = []; 
  districts: any[] = []; 
  allNeighborhoods: any[] = [];
  
  neighborhoodNameInput: string = ""; 

  selectedCityId: number = 0;
  selectedDistrictId: number = 0;
  selectedNeighborhoodId: number = 0;

  @Output() locationChanged = new EventEmitter<any>();

  constructor(private reService: RealEstateService) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData() {
    this.reService.getCities().subscribe({
      next: (resCity) => {
        if (resCity?.success) {
          this.cities = resCity.data;
          
          this.reService.getDistricts().subscribe({
            next: (resDist) => {
              if (resDist?.success) {
                this.allDistricts = resDist.data;
                
                this.reService.getNeighborhoods().subscribe({
                  next: (resNeigh) => {
                    this.allNeighborhoods = resNeigh.data || resNeigh;
                    console.log("Toplam Yüklenen Mahalle:", this.allNeighborhoods.length);
                  },
                  error: (err) => console.error("Mahalleler yüklenemedi", err)
                });
              }
            },
            error: (err) => console.error("İlçeler yüklenemedi", err)
          });
        }
      },
      error: (err) => console.error("Şehirler yüklenemedi", err)
    });
  }

  onCityChange() {
    this.selectedDistrictId = 0;
    this.selectedNeighborhoodId = 0;
    this.neighborhoodNameInput = "";
    this.districts = this.allDistricts.filter(d => d.cityId == this.selectedCityId);
    this.emitLocation();
  }

  onDistrictChange() {
    this.selectedNeighborhoodId = 0;
    this.neighborhoodNameInput = "";
    this.emitLocation();
  }

  onManualNeighborhoodChange() {
    if (this.allNeighborhoods.length > 0) {
        this.selectedNeighborhoodId = this.allNeighborhoods[0].neighborhoodId;
    } else {
        this.selectedNeighborhoodId = 1; 
    }
    this.emitLocation();
  }

  emitLocation() {
    const cityObj = this.cities.find(c => c.cityId == this.selectedCityId);
    const districtObj = this.allDistricts.find(d => d.districtId == this.selectedDistrictId);

    this.locationChanged.emit({
      cityId: Number(this.selectedCityId),
      cityName: cityObj ? cityObj.cityName : 'Bilinmiyor',
      districtId: Number(this.selectedDistrictId),
      districtName: districtObj ? districtObj.districtName : 'Bilinmiyor',
      neighborhoodId: Number(this.selectedNeighborhoodId||1),
      neighborhoodName: this.neighborhoodNameInput 
    });
  }
}
