import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AnalysisService } from '../../services/analysis.service';
import { AuthService } from '../../models/authService';
import { MapInteractionService } from '../../services/map-interaction.service';
import { RealEstateService } from '../../services/real-estate.service';
import { MapUtils } from '../../utils/map.utils';
import { LocationInfo } from '../../models/location.model';

@Component({
  selector: 'app-area-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-analysis.component.html',
  styleUrl: './area-analysis.component.css'
})
export class AreaAnalysisComponent implements OnInit, OnDestroy, AfterViewInit {
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
    this.listenGlobalEvents();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    setTimeout(() => {
      const mapElement = document.getElementById('map');
      if (mapElement && mapElement.offsetHeight > 0) {
        this.mapService.initMap('map');
        const map = this.mapService.getMapInstance();
        if (map) {
          map.invalidateSize();
          setTimeout(() => map.invalidateSize(), 200);
        }
      } else {
        setTimeout(() => this.initializeMap(), 300);
      }
    }, 500);
  }

  private listenGlobalEvents(): void {
    this.mapService.drawEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((geoJSON: any) => this.points.push(geoJSON));

    this.mapService.analysisResult$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        if (typeof result === 'string') {
          this.runAnalysisFlow(result);
        }
      });

    this.mapService.locationFilter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filter) => {
        if (!filter) {
          this.clearAll();
          this.mapService.resetMap();
        }
      });
  }

  private runAnalysisFlow(operation: string): void {
    const isTriple = operation.includes('abc');
    const requiredCount = isTriple ? 3 : 2;

    if (this.points.length < requiredCount) {
      alert(`Bu işlem için ${requiredCount} adet poligon çizmelisiniz.`);
      return;
    }

    const payload = this.prepareAnalysisPayload(operation);
    this.analysisService.calculate(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const data = response?.success ? response.data : response;
          if (data) this.handleAnalysisSuccess(data, operation);
        },
        error: (err) => console.error('Analiz API Hatası:', err)
      });
  }

  private prepareAnalysisPayload(operation: string) {
    return {
      geometryA: MapUtils.cleanGeometry(this.points[0]?.geometry),
      geometryB: MapUtils.cleanGeometry(this.points[1]?.geometry),
      geometryC: this.points[2] ? MapUtils.cleanGeometry(this.points[2].geometry) : null,
      operationType: operation
    };
  }

  private handleAnalysisSuccess(data: any, operation: string): void {
    if (data.geometry) {
      this.mapService.drawResult(data.geometry);
    }
    this.mapService.setAnalysisResult(data);
    this.autoSave(data, operation);
  }

  private autoSave(result: any, operation: string): void {
    const userId = this.authService.getUserId() ?? '';
    const userRole = this.authService.getUserRole();
    if (!userId) return;
    const savePayload = this.reService.prepareAnalysisPayload(result, this.selectedLocationNames, userId, userRole, operation);
    this.reService.saveRealEstate(savePayload).pipe(takeUntil(this.destroy$)).subscribe();
  }

  onSidebarLocationChanged(event: LocationInfo): void {
    this.selectedLocationNames = { ...event };
    this.mapService.applyLocationFilter(event);
  }

  private clearAll(): void {
    this.points = [];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}