import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../services/location.service';
import { City, District, LocationInfo, Neighborhood } from '../../models/location.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.css']
})
export class LocationSelectorComponent implements OnInit,OnDestroy {
  cities: City[] = [];
  districts: District[] = []; 
  neighborhoods: Neighborhood[] = [];

  selectedCityId: number = 0;
  selectedDistrictId: number = 0;
  selectedNeighborhoodId: number = 0;

  @Output() locationChanged = new EventEmitter<LocationInfo>();
  
  private destroy$=new Subject<void>();

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.loadCities();
  }

  private loadCities() {
    this.locationService.getCities()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next:(data)=>this.cities=data,
      error:(err)=>console.error("Şehirler yüklenemedi",err)
    });
  }

  onCityChange():void {
    this.resetSelection('city');
    if (this.selectedCityId<=0) return;

      this.locationService.getDistricts(this.selectedCityId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data=>this.districts=data);
    
  }

  onDistrictChange():void {
    this.resetSelection('district');
    if(this.selectedCityId<=0) return;
    this.locationService.getDistricts(this.selectedCityId)
    .pipe(takeUntil(this.destroy$))
    .subscribe(data=>{
      this.neighborhoods=data;
      this.emitLocation();
    });
  }
    onNeighborhoodChange():void {
    this.emitLocation();
  }
  private resetSelection(level: 'city' | 'district') {
    if (level==='city') {
      this.districts=[];
      this.selectedDistrictId=0;
    }
    this.neighborhoods=[];
    this.selectedNeighborhoodId=0;
    this.emitLocation();
  }
  private emitLocation():void {
    const cityId = Number(this.selectedCityId);
    const districtId = Number(this.selectedDistrictId);
    const neighborhoodId = Number(this.selectedNeighborhoodId);

    const city=this.cities.find(c=>c.id===cityId);
    const district=this.districts.find(d=>d.id===districtId);
    const neighborhood=this.neighborhoods.find(n=>n.id===neighborhoodId);

    this.locationChanged.emit({
      cityId: cityId,
      cityName: city?.name || '',
      districtId: districtId,
      districtName: district?.name || '', 
      neighborhoodId:neighborhoodId,
      neighborhoodName: neighborhood?.name || ''
    });
  }
    ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}