import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../services/location.service';
import { LocationInfo } from '../../models/locatin-info.model';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.css']
})
export class LocationSelectorComponent implements OnInit {
  cities: any[] = [];
  districts: any[] = []; 
  neighborhoods: any[] = [];

  selectedCityId: number = 0;
  selectedDistrictId: number = 0;
  selectedNeighborhoodId: number = 0;

  @Output() locationChanged = new EventEmitter<LocationInfo>();

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.loadCities();
  }

  private loadCities() {
    this.locationService.getCities().subscribe({
      next: (data) => this.cities = data,
      error: (err) => console.error("Şehirler yüklenemedi", err)
    });
  }

  onCityChange() {
    this.districts = [];
    this.neighborhoods = [];
    this.selectedDistrictId = 0;
    this.selectedNeighborhoodId = 0;

    if (this.selectedCityId > 0) {
      this.locationService.getDistricts(this.selectedCityId).subscribe(data => {
        this.districts = data;
        this.emitLocation();
      });
    }
  }

  onDistrictChange() {
    this.neighborhoods = [];
    this.selectedNeighborhoodId = 0;

    if (this.selectedDistrictId > 0) {
      this.locationService.getNeighborhoods(this.selectedDistrictId).subscribe(data => {
        this.neighborhoods = data;
        this.emitLocation();
      });
    }
  }

  onNeighborhoodChange() {
    this.emitLocation();
  }

  private emitLocation() {
    const city = this.cities.find(c => c.id == this.selectedCityId);
    const district = this.districts.find(d => d.id == this.selectedDistrictId);
    const neighborhood = this.neighborhoods.find(n => n.id == this.selectedNeighborhoodId);

    this.locationChanged.emit({
      cityId: Number(this.selectedCityId),
      cityName: city?.name || '',
      districtId: Number(this.selectedDistrictId),
      districtName: district?.name || '', 
      neighborhoodId: Number(this.selectedNeighborhoodId),
      neighborhoodName: neighborhood?.name || ''
    });
  }
}