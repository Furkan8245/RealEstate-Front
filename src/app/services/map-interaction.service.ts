import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import * as L from 'leaflet';
import 'leaflet-draw';
import { MapUtils } from '../utils/map.utils';
import { LocationInfo } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class MapInteractionService {
  
  private map!: L.Map;
  private drawnItems: L.FeatureGroup = new L.FeatureGroup();
  private resultLayer: L.GeoJSON | null = null;

  private locationFilterSubject = new BehaviorSubject<LocationInfo | null>(null);
  locationFilter$ = this.locationFilterSubject.asObservable();
  
  private drawEventSource = new Subject<any>();
  drawEvent$ = this.drawEventSource.asObservable();
  
  private pointsCountSource = new BehaviorSubject<number>(0);
  pointsCount$ = this.pointsCountSource.asObservable();

  private analysisRequestSource = new Subject<string>();
  analysisRequest$ = this.analysisRequestSource.asObservable();

  private analysisResultSource = new BehaviorSubject<any>(null);
  analysisResult$ = this.analysisResultSource.asObservable();

  private resetSource = new Subject<void>();
  resetRequest$ = this.resetSource.asObservable();

  public getMapInstance(): L.Map {
    return this.map;
  }

  initMap(elementId: string): void {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 100);
      return;
    }

    this.map = L.map(elementId).setView([39.9334, 32.8597], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: 'OpenStreetMap'
    }).addTo(this.map);

    this.map.addLayer(this.drawnItems);
    this.map.addControl(MapUtils.getDrawControl(this.drawnItems));

    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      this.drawnItems.addLayer(layer);
      this.drawEventSource.next(layer.toGeoJSON());
      this.updatePointsCount(this.drawnItems.getLayers().length);
    });

    setTimeout(() => this.map.invalidateSize(), 200);
  }

  applyLocationFilter(filter: LocationInfo | null): void {
    this.locationFilterSubject.next(filter);
  }

  drawResult(geometry: any): void {
    if (!geometry || !this.map) return;

    this.clearResultLayer();
    
    this.resultLayer = L.geoJSON(geometry, {
      style: { color: '#e74c3c', weight: 4, fillColor: '#f1c40f', fillOpacity: 0.5 }
    }).addTo(this.map);

    const bounds = this.resultLayer.getBounds();
    if (bounds.isValid()) this.map.fitBounds(bounds);
  }

  executeAnalysis(operation: string): void {
    this.analysisRequestSource.next(operation);
  }

  resetMap(): void {
    this.drawnItems.clearLayers();
    this.clearResultLayer();
    this.updatePointsCount(0);
    this.analysisResultSource.next(null);
  }

  private clearResultLayer(): void {
    if (this.resultLayer && this.map) {
      this.map.removeLayer(this.resultLayer);
      this.resultLayer = null;
    }
  }

  updatePointsCount(count: number): void {
    this.pointsCountSource.next(count);
  }

  setAnalysisResult(result: any): void {
    this.analysisResultSource.next(result);
  }
}