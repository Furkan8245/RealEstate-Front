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
import { MapUtils } from '../../utils/map.utils';
import { LocationInfo } from '../../models/locatin-info.model';

@Component({
  selector: 'app-area-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, AreaFormatPipe, SidebarComponent],
  templateUrl: './area-analysis.component.html',
  styleUrl: './area-analysis.component.css'
})
export class AreaAnalysisComponent implements OnInit {
  selectedLocationNames: LocationInfo = { cityName: '', districtName: '', neighborhoodName: '' };
  map!: L.Map;
  drawnItems: L.FeatureGroup = new L.FeatureGroup();
  points: any[] = [];
  selectedOperation: string = 'intersectionab';
  analysisResult: any = null;
  resultLayer: L.GeoJSON | null = null;
  isAdmin: boolean = false;

  constructor(
    private analysisService: AnalysisService,
    private authService: AuthService,
    private mapService: MapInteractionService,
    private reService: RealEstateService
  ) {}

  ngOnInit() {
    this.initMap();
    this.listenSidebarEvents();
    this.checkAdminStatus();
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
    this.isAdmin = Array.isArray(roles) ? roles.includes('admin') : roles === 'admin';
  }

  onSidebarLocationChanged(event: LocationInfo) {
    this.selectedLocationNames = { ...event };
  }

  private initMap() {
    this.map = L.map('map').setView([39.9334, 32.8597], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: "OpenStreetMap"
    }).addTo(this.map);

    this.map.addLayer(this.drawnItems);

    const drawControl = MapUtils.getDrawControl(this.drawnItems);
    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      this.drawnItems.addLayer(layer);
      this.points.push(layer.toGeoJSON());
      this.mapService.updatePointsCount(this.points.length);
    });
  }

  sendToAnalysis() {
    if (this.points.length < 3) {
      alert("Lütfen geometrileri tamamlayın: A, B ve C (Toplam 3 adet).");
      return;
    }

    const payload = {
      geometryA: MapUtils.cleanGeometry(this.points[0].geometry),
      geometryB: MapUtils.cleanGeometry(this.points[1].geometry),
      geometryC: MapUtils.cleanGeometry(this.points[2].geometry),
      operationType: this.selectedOperation,
      description: "Angular Analiz İşlemi"
    };

    this.analysisService.calculate(payload).subscribe({
      next: (res) => this.handleAnalysisResponse(res),
      error: (err) => this.handleError(err)
    });
  }

  private handleAnalysisResponse(res: any) {
    if (!res?.success) {
      alert(res?.message || "Analiz başarısız oldu.");
      return;
    }

    this.analysisResult = res.data;
    this.mapService.setAnalysisResult(this.analysisResult);

    if (this.analysisResult?.geometry) {
      this.drawResultOnMap(this.analysisResult.geometry);
      this.saveToDatabase(this.analysisResult);
    }
    this.resetDrawingState();
  }

  private saveToDatabase(result: any) {
    const userId = this.authService.getUserId();
    const userRole = this.authService.getUserRole();
    if (!userId) return;

    const savePayload = this.reService.prepareAnalysisPayload(
      result,
      this.selectedLocationNames,
      userId,
      userRole,
      this.selectedOperation
    );

    this.reService.saveRealEstate(savePayload).subscribe({
      next: () => console.log("Başarıyla kaydedildi."),
      error: (err) => this.handleError(err)
    });
  }

  private handleError(err: any) {
    console.error("Hata oluştu:", err);
    alert("Bir hata oluştu. Detaylar konsolda.");
  }

  private resetDrawingState() {
    this.points = [];
    this.drawnItems.clearLayers();
    this.mapService.updatePointsCount(0);
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

  resetMap() {
    this.drawnItems.clearLayers();
    if (this.resultLayer) {
      this.map.removeLayer(this.resultLayer);
    }
    this.points = [];
    this.analysisResult = null;
    this.mapService.updatePointsCount(0);
  }
} 