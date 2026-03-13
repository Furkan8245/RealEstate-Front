import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
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
export class AreaAnalysisComponent implements OnInit, OnDestroy {
  private points: any[] = [];
  private destroy$ = new Subject<void>();
  selectedLocationNames!: LocationInfo;

  constructor(
    private mapService: MapInteractionService,
    private analysisService: AnalysisService,
    private authService: AuthService,
    private reService: RealEstateService
  ) {}

  ngOnInit(): void {
    // 1. Haritayı Motor üzerinden başlat
    this.mapService.initMap('map');

    // 2. Çizim olaylarını dinle (Geometri toplama)
    this.mapService.setupDrawEvents((geoJson) => {
      this.points.push(geoJson);
    });

    // 3. Sidebar'dan gelen aksiyonları dinle
    this.listenGlobalEvents();
  }

  private listenGlobalEvents(): void {
    // Analiz isteği geldiğinde
    this.mapService.analysisRequest$
      .pipe(takeUntil(this.destroy$))
      .subscribe(operation => this.runAnalysisFlow(operation));

    // Sıfırlama isteği geldiğinde
    this.mapService.resetRequest$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.clearAll());
  }

  private runAnalysisFlow(operation: string): void {
    if (this.points.length < 3) return alert("Eksik veri: 3 poligon gerekli.");

    const payload = {
      geometryA: MapUtils.cleanGeometry(this.points[0].geometry),
      geometryB: MapUtils.cleanGeometry(this.points[1].geometry),
      geometryC: MapUtils.cleanGeometry(this.points[2].geometry),
      operationType: operation
    };

    this.analysisService.calculate(payload).subscribe({
      next: (res) => {
        if (res?.success) {
          // Harita Motoruna "Sonucu Çiz" emri ver
          this.mapService.drawResult(res.data.geometry);
          // Sidebar ve diğerleri için sonucu yay
          this.mapService.setAnalysisResult(res.data);
          // Veritabanına kaydetme logic'ini tetikle
          this.autoSave(res.data, operation);
        }
      }
    });
  }

  private autoSave(result: any, operation: string): void {
    const userId = this.authService.getUserId() ?? '';
    const userRole = this.authService.getUserRole();
    
    if (!userId || userId==='') {
      console.warn("Kullanıcı bilgisi bulunamadı, analiz sonucu kaydedilmeyecek.");
      return;
    }
    const savePayload = this.reService.prepareAnalysisPayload(
      result, this.selectedLocationNames, userId, userRole, operation
    );

    this.reService.saveRealEstate(savePayload).subscribe();
  }

  onSidebarLocationChanged(event: LocationInfo): void {
    this.selectedLocationNames = { ...event };
  }

  private clearAll(): void {
    this.points = [];
    this.mapService.resetMap();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}