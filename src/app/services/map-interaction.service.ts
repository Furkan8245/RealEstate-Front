import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import * as L from 'leaflet';
import { MapUtils } from '../utils/map.utils';

@Injectable({ providedIn: 'root' })
export class MapInteractionService {
  // --- Harita Nesneleri (Sadece bu servis bilir) ---
  private map!: L.Map;
  private drawnItems: L.FeatureGroup = new L.FeatureGroup();
  private resultLayer: L.GeoJSON | null = null;

  // --- State (Durum) Yönetimi ---
  private pointsCountSource = new BehaviorSubject<number>(0);
  pointsCount$ = this.pointsCountSource.asObservable();

  private analysisResultSource = new BehaviorSubject<any>(null);
  analysisResult$ = this.analysisResultSource.asObservable();

  private analysisSource = new Subject<any>();
  analysisRequest$ = this.analysisSource.asObservable();

  private resetSource = new Subject<void>();
  resetRequest$ = this.resetSource.asObservable();

  // --- Harita Operasyonları ---

  initMap(elementId: string): L.Map {
    this.map = L.map(elementId).setView([39.9334, 32.8597], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: 'OpenStreetMap'
    }).addTo(this.map);

    this.map.addLayer(this.drawnItems);
    this.map.addControl(MapUtils.getDrawControl(this.drawnItems));

    return this.map;
  }

  // Çizim olaylarını buraya taşıdık
  setupDrawEvents(onDraw: (geoJson: any) => void) {
    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      this.drawnItems.addLayer(layer);
      onDraw(layer.toGeoJSON());
      this.updatePointsCount(this.drawnItems.getLayers().length);
    });
  }

  drawResult(geometry: any) {
    this.clearResultLayer();
    this.resultLayer = L.geoJSON(geometry, {
      style: { color: '#e74c3c', weight: 4, fillColor: '#f1c40f', fillOpacity: 0.5 }
    }).addTo(this.map);

    const bounds = this.resultLayer.getBounds();
    if (bounds.isValid()) this.map.fitBounds(bounds);
  }

  resetMap() {
    this.drawnItems.clearLayers();
    this.clearResultLayer();
    this.updatePointsCount(0);
    this.analysisResultSource.next(null);
  }

  private clearResultLayer() {
    if (this.resultLayer) {
      this.map.removeLayer(this.resultLayer);
      this.resultLayer = null;
    }
  }

  // --- Eski Helper Metodların ---
  updatePointsCount(count: number) { this.pointsCountSource.next(count); }
  sendAnalysisRequest(data: any) { this.analysisSource.next(data); }
  sendResetRequest() { this.resetSource.next(); }
  setAnalysisResult(result: any) { this.analysisResultSource.next(result); }
}