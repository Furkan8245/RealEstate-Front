import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet-draw';
import { AnalysisService } from '../../services/analysis.service';

@Component({
  selector: 'app-area-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-analysis.component.html',
  styleUrl: './area-analysis.component.css'
})
export class AreaAnalysisComponent implements OnInit {
  map!: L.Map;
  drawnItems: L.FeatureGroup = new L.FeatureGroup();
  points: any[] = [];
  selectedOperation: string = 'intersectionAB'; // Backend switch ile uyumlu
  analysisResult: any = null;
  resultLayer: L.GeoJSON | null = null;

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() {
    this.initMap();
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
        polygon: {
          allowIntersection: false,
          showArea: true
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
      }
    });
    this.map.addControl(drawTools);

    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      this.drawnItems.addLayer(layer);
      
      // Leaflet-draw çıktısını GeoJSON formatında sakla
      const geoJson = layer.toGeoJSON();
      this.points.push(geoJson);

      if (this.points.length === 3) {
        alert("REQ-4: A, B ve C poligonları hazır.");
      }
    });
  }

  // REQ-9: Backend'e sadece saf geometri verisini gönderir
  cleanGeometry(geo: any) {
    if (!geo) return null;
    return {
      type: geo.type,
      coordinates: geo.coordinates
    };
  }

  sendToAnalysis() {
    // REQ-5 Validation
    if (this.points.length < 3) {
      alert("Lütfen A, B ve C poligonlarını çizin (Eksik geometri).");
      return;
    }

    console.log("Analiz başlatılıyor...");

    const payload = {
      geometryA: this.cleanGeometry(this.points[0].geometry),
      geometryB: this.cleanGeometry(this.points[1].geometry),
      geometryC: this.cleanGeometry(this.points[2].geometry),
      operationType: this.selectedOperation,
      description: "Angular Analiz İşlemi"
    };

    this.analysisService.calculate(payload).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          this.analysisResult = response.data;
          
          if (response.analysisResult.geometry) {
            this.drawResultOnMap(this.analysisResult.geometry); 
          }
          this.points=[];
          this.drawnItems.clearLayers();
        } else {
          alert(response.message || "İşlem başarısız.");
        }
      },
      error: (err) => {
        console.error("API Hatası:", err);
        const errorMsg = err.error?.message || "Sunucuyla bağlantı kurulamadı.";
        alert("Hata: " + errorMsg);
      }
    });
  }

  drawResultOnMap(geometry: any) {
    // Eski sonucu temizle
    if (this.resultLayer) {
      this.map.removeLayer(this.resultLayer);
    }

    // Yeni sonucu ekle (Kırmızı ve kalın çizgi)
    this.resultLayer = L.geoJSON(geometry, {
      style: {
        color: '#e74c3c',
        weight: 4,
        fillColor: '#f1c40f',
        fillOpacity: 0.5
      }
    }).addTo(this.map);

    // Haritayı sonuca odakla
    const bounds = this.resultLayer.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds);
    }
  }

  // REQ-15: Sayfayı ve haritayı temizle
  resetMap() {
    this.drawnItems.clearLayers();
    if (this.resultLayer) {
      this.map.removeLayer(this.resultLayer);
    }
    this.points = [];
    this.analysisResult = null;
    console.log("Harita sıfırlandı.");
  }
}