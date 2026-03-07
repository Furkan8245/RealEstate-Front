import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RealEstateService } from '../../services/real-estate.service';
import { LocationService } from '../../services/location.service';

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
  


  selectedCityId: number = 0;
  selectedDistrictId: number = 0;
  selectedNeighborhoodId: number = 0;

  @Output() locationChanged = new EventEmitter<any>();

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.locationService.getCities().subscribe({
      next: (data) => this.cities = data,
      error:(err)=>console.error("Şehirler yüklenemedi",err)
    });
  }

  // loadInitialData() {
  //   this.locationService.getCities().subscribe({
  //     next: (resCity) => {
  //       if (resCity?.success) {
  //         this.cities = resCity.data;
          
  //         this.reService.getDistricts().subscribe({
  //           next: (resDist) => {
  //             if (resDist?.success) {
  //               this.allDistricts = resDist.data;
                
  //               this.reService.getNeighborhoods().subscribe({
  //                 next: (resNeigh) => {
  //                   this.allNeighborhoods = resNeigh.data || resNeigh;
  //                   console.log("Toplam Yüklenen Mahalle:", this.allNeighborhoods.length);
  //                 },
  //                 error: (err) => console.error("Mahalleler yüklenemedi", err)
  //               });
  //             }
  //           },
  //           error: (err) => console.error("İlçeler yüklenemedi", err)
  //         });
  //       }
  //     },
  //     error: (err) => console.error("Şehirler yüklenemedi", err)
  //   });
  // }

  onCityChange() {
    this.districts = [];
    this.allNeighborhoods = [];
    this.selectedDistrictId =0;
    this.selectedNeighborhoodId=0;

    if (this.selectedCityId>0) {
      this.locationService.getDistricts(this.selectedCityId).subscribe(data=>{
        this.districts = data;
        this.emitLocation();
      });
    }
  }

  onDistrictChange() {
    this.allNeighborhoods = [];
    this.selectedNeighborhoodId = 0;
    if (this.selectedDistrictId > 0) {
      this.locationService.getNeighborhoods(this.selectedDistrictId).subscribe(data=>{
        this.allNeighborhoods = data;
        this.emitLocation();
      })
    }
  }

  onNeighborhoodChange() {
    this.emitLocation();
  }

  emitLocation() {
    const cityObj = this.cities.find(c => c.id == this.selectedCityId);
    const districtObj = this.districts.find(d => d.id == this.selectedDistrictId);
    const neighborhoodObj = this.allNeighborhoods.find(n => n.id == this.selectedNeighborhoodId);

    this.locationChanged.emit({
     cityId: Number(this.selectedCityId),
    cityName: cityObj?.name || '',
    districtId: Number(this.selectedDistrictId),
    districtName: districtObj?.name || '', 
    neighborhoodId: Number(this.selectedNeighborhoodId),
    neighborhoodName: neighborhoodObj?.name || ''
  });
  }
}
