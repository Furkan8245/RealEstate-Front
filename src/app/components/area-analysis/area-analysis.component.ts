import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, Subject, takeUntil } from 'rxjs';
import { AnalysisService } from '../../services/analysis.service';
import { AreaFormatPipe } from '../../pipes/area.pipe';
import { AuthService } from '../../models/authService';
import { MapInteractionService } from '../../services/map-interaction.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RealEstateService } from '../../services/real-estate.service';
import { MapUtils } from '../../utils/map.utils';
import { LocationInfo } from '../../models/location.model';
import { geoJSON } from 'leaflet';

@Component({
  selector: 'app-area-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, AreaFormatPipe, SidebarComponent],
  templateUrl: './area-analysis.component.html',
  styleUrl: './area-analysis.component.css'
})
export class AreaAnalysisComponent implements OnInit, OnDestroy,AfterViewInit {
  private points: any[] = [];
  private destroy$ = new Subject<void>();
  selectedLocationNames!:LocationInfo;

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
    setTimeout(()=>{
      this.mapService.initMap('map');
    },200);
  }

  private listenGlobalEvents(): void {
    
    this.mapService.drawEvent$
      .pipe(takeUntil(this.destroy$))
      .subscribe((geoJSON:any)=>{
        this.points.push(geoJSON);
      })
    this.mapService.analysisResult$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result:any)=>{
        if (typeof result === 'string') {
          this.runAnalysisFlow(result);
        }
      });

      this.mapService.locationFilter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((filter)=>{
        if(!filter) {
          this.clearAll();
          this.mapService.resetMap();
        }
      });
  }

  private runAnalysisFlow(operation: string): void {
    if (this.points.length < 3) return alert("Eksik veri: 3 poligon gerekli.");

    const payload = {
      geometryA: MapUtils.cleanGeometry(this.points[0].geometry),
      geometryB: MapUtils.cleanGeometry(this.points[1].geometry),
      geometryC: MapUtils.cleanGeometry(this.points[2].geometry),
      operationType: operation
    };

    this.analysisService.calculate(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next:(response)=>{
        if (response?.success) {
          this.handleAnalysisSuccess(response.data,operation);
        }
      },
      error:(err)=>console.error('Analiz hatası:',err)
    });
  }

  private handleAnalysisSuccess(data:any,operation:string):void{
    this.mapService.drawResult(data.geometry);
    this.mapService.setAnalysisResult(data);
    this.autoSave(data,operation);
  }


  private autoSave(result: any, operation: string): void {
    const userId = this.authService.getUserId() ?? '';
    const userRole = this.authService.getUserRole();
    
    if(!userId) return;
    
    const savePayload = this.reService.prepareAnalysisPayload(
      result, this.selectedLocationNames, userId, userRole, operation
    );

    this.reService.saveRealEstate(savePayload)
    .pipe(takeUntil(this.destroy$))
    .subscribe();
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