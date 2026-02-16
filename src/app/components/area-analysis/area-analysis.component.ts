import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-draw';
import { AnalysisService } from '../../services/analysis.service';
import { AreaFormatPipe } from '../../pipes/area.pipe';
import { AuthService } from '../../models/authService';
import { MapInteractionService } from '../../services/map-interaction.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RealEstateService } from '../../services/real-estate.service';

@Component({
  selector: 'app-area-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, AreaFormatPipe, SidebarComponent],
  templateUrl: './area-analysis.component.html',
  styleUrl: './area-analysis.component.css'
})
export class AreaAnalysisComponent implements OnInit {
  selectedLocationNames: any = { cityName: '', districtName: '', neighborhoodName: '' };
  calculatedAre: number = 0;
  map!: L.Map;
  drawnItems: L.FeatureGroup = new L.FeatureGroup();
  points: any[] = [];
  selectedOperation: string = 'intersectionab';
  analysisResult: any = null;
  resultLayer: L.GeoJSON | null = null;
  isAdmin: boolean = false;

  cities: any[] = [];
  districts: any[] = [];
  neighborhoods: any[] = [];
  selectedCityId: number = 0;
  selectedDistrictId: number = 0;
  selectedNeighborhoodId: number = 0;

  constructor(
    private analysisService: AnalysisService,
    private authService: AuthService,
    private mapService: MapInteractionService,
    private reService: RealEstateService
  ) {}

  ngOnInit() {
    this.initMap();
    this.listenSidebarEvents();
  
  }
  private listenSidebarEvents() {
    this.mapService.analysisRequest$.subscribe(op => {
      this.selectedOperation = op;
      this.sendToAnalysis();
    });
    this.mapService.resetRequest$.subscribe(() => {
      this.resetMap();
    });
  }

  checkAdminStatus() {
    const roles = this.authService.getUserRoles();
    if (Array.isArray(roles)) {
      this.isAdmin = roles.includes('admin');
    } else {
      this.isAdmin = roles == 'admin';
    }
  }

  private initMap() {
    this.map = L.map('map').setView([39.9334, 32.8597], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: "OpenStreetMap"
    }).addTo(this.map);
    this.map.addLayer(this.drawnItems);
    const drawTools = new L.Control.Draw({
      edit: { featureGroup: this.drawnItems },
      draw: {
        polygon: { allowIntersection: true, showArea: true, shapeOptions: { color: '#3388ff' } },
        rectangle: { shapeOptions: { color: '#3388ff' } },
        polyline: false, circle: false, marker: false, circlemarker: false
      }
    });
    this.map.addControl(drawTools);
    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      this.drawnItems.addLayer(layer);
      const geoJson = layer.toGeoJSON();
      this.points.push(geoJson);
      this.mapService.updatePointsCount(this.points.length);
    });
  }

  cleanGeometry(geo: any) {
    if (!geo) return null;
    return {
      type: geo.type,
      coordinates: geo.coordinates
    };
  }

  sendToAnalysis() {
    if (this.points.length < 3) {
      alert("Lütfen geometrileri tamamlayın: A, B ve C (Toplam 3 adet).");
      return;
    }
    const payload = {
      geometryA: this.cleanGeometry(this.points[0].geometry),
      geometryB: this.cleanGeometry(this.points[1].geometry),
      geometryC: this.cleanGeometry(this.points[2].geometry),
      operationType: this.selectedOperation,
      description: "Angular Analiz İşlemi"
    };
    this.analysisService.calculate(payload).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.analysisResult = response.data;
          this.mapService.setAnalysisResult(response.data);
          if (this.analysisResult.geometry) {
            this.drawResultOnMap(this.analysisResult.geometry);
            this.saveToDatabase(this.analysisResult);
          }
          this.points = [];
          this.drawnItems.clearLayers();
          this.mapService.updatePointsCount(0);
        } else {
          alert(response.message || "İşlem başarısız.");
        }
      },
      error: (err) => {
        const errorMsg = err.error?.errors ? JSON.stringify(err.error.errors) : (err.error?.message || "Sunucuyla bağlantı kurulamadı.");
        alert("Hata Oluştu: " + errorMsg);
      }
    });
  }

  private saveToDatabase(result: any) {
  const userId = this.authService.getUserId();
  if (!userId || !result.geometry || !result.geometry.coordinates) return;

  const firstCoordinates = result.geometry.type === 'Point'
    ? result.geometry.coordinates
    : result.geometry.coordinates[0][0];

  const savePayload = {
    cityId: this.selectedCityId > 0 ? Number(this.selectedCityId) : 1,
    districtId: this.selectedDistrictId > 0 ? Number(this.selectedDistrictId) : 1,
    neighborhoodId: this.selectedNeighborhoodId > 0 ? Number(this.selectedNeighborhoodId) : 1,
    cityName: this.selectedLocationNames.cityName || '',
    districtName: this.selectedLocationNames.districtName || '',
    neighborhoodName: this.selectedLocationNames.neighborhoodName || '',
    propertyName: `Analiz ${new Date().toLocaleDateString()}`,
    parcelNumber: `P-${Math.floor(Math.random() * 1000)}`,
    lotNumber: this.selectedOperation,
    area: Number(result.area),
    address: `${this.selectedLocationNames.cityName || ''} / ${this.selectedLocationNames.districtName || ''} / ${this.selectedLocationNames.neighborhoodName || ''}`,
    propertyTypeId: 1,
    ownerId: Number(userId),
    coordinateX: firstCoordinates[0],
    coordinateY: firstCoordinates[1],
  };

  console.log("Veritabanına giden paket:", savePayload);

  this.reService.saveRealEstate(savePayload).subscribe({
    next: (res) => {
      console.log("Veritabanına başarıyla kaydedildi!");
    },
    error: (err) => {
      console.error("Veritabanı kayıt hatası:", err);
      alert("Kayıt sırasında hata oluştu. Lütfen geçerli bir konum seçtiğinizden emin olun.");
    }
  });
}


  drawResultOnMap(geometry: any) {
    if (this.resultLayer) {
      this.map.removeLayer(this.resultLayer);
    }
    this.resultLayer = L.geoJSON(geometry, {
      style: { color: '#e74c3c', weight: 4, fillColor: '#f1c40f', fillOpacity: 0.5 }
    }).addTo(this.map);
    const bounds = this.resultLayer.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds);
    }
  }
  onLocationChanged(event: any) {
  console.log("AreaAnalysis veriyi teslim aldı:", event);
  this.selectedCityId = event.cityId;
  this.selectedDistrictId = event.districtId;
  this.selectedNeighborhoodId = event.neighborhoodId;
  this.selectedLocationNames = {
    cityName: event.cityName,
    districtName: event.districtName,
    neighborhoodName: event.neighborhoodName
  };
}

  resetMap() {
    this.drawnItems.clearLayers();
    if (this.resultLayer) {
      this.map.removeLayer(this.resultLayer);
    }
    this.points = [];
    this.analysisResult = null;
    this.mapService.updatePointsCount(0);
    this.selectedCityId = 0;
    this.selectedDistrictId = 0;
    this.selectedNeighborhoodId = 0;
  }
  
}