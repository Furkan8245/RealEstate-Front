import { Component, OnInit, OnDestroy, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { MenuItem } from "../../models/menu-item";
import { AuthService } from "../../models/authService";
import { MapInteractionService } from "../../services/map-interaction.service";
import { ReportService } from "../../services/report.service";
import { LocationSelectorComponent } from "../location/location-selector.component";
import { LogoutButtonComponent } from "../logout-button/logout-button.component";
import { LocationInfo } from "../../models/locatin-info.model";
import { AreaFormatPipe } from "../../pipes/area.pipe";
import html2canvas from "html2canvas";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    LocationSelectorComponent, 
    LogoutButtonComponent, 
    AreaFormatPipe
  ],
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() locationChanged = new EventEmitter<LocationInfo>();

  menuItems: MenuItem[] = [
    { label: "Taşınmazlar", icon: "fa-user-o", route: "/real-estates", roles: ["Admin", "User"] },
    { label: "Kullanıcı Türleri", icon: "fa-clone", route: "/user-types", roles: ["Admin"] },
    { label: "Operasyon Türleri", icon: "fa-star-o", route: "/ops", roles: ["Admin"] },
    { label: "Sistem Logları", icon: "fa-history", route: "/audit-log", roles: ["Admin"] },
  ];

  filteredMenu: MenuItem[] = [];
  isAdmin: boolean = false;
  showAnalysisForm: boolean = false;
  selectedOperation: string = "intersectionab";
  analysisResult: any = null;
  pointsCount: number = 0;
  currentLocation: LocationInfo = { cityId: 0, districtId: 0, neighborhoodId: 0, cityName: '', districtName: '', neighborhoodName: '' };
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private mapService: MapInteractionService,
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAdminStatus();
    this.loadMenuByRole();
    this.listenMapStreams();
  }

  private checkAdminStatus(): void {
    this.isAdmin = this.authService.isAdmin();
  }

  private loadMenuByRole(): void {
    const userRole = this.authService.getUserRole();
    this.filteredMenu = this.menuItems.filter(item => item.roles.includes(userRole));
  }

  private listenMapStreams(): void {
    this.mapService.pointsCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.pointsCount = count);

    this.mapService.analysisResult$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => this.analysisResult = res);
  }

  handleLocationChanged(event: LocationInfo): void {
    this.currentLocation = { ...event };
    this.mapService.updateLocation(this.currentLocation);
    this.locationChanged.emit(this.currentLocation);
  }

  toggleAnalysisForm(): void {
    if (!this.showAnalysisForm && this.pointsCount < 3) {
      alert("Analiz için en az 3 poligon gereklidir.");
      return;
    }
    this.showAnalysisForm = !this.showAnalysisForm;
  }

  executeAnalysis(): void {
    if (this.pointsCount < 3) return alert("Eksik poligon!");
    this.mapService.sendAnalysisRequest(this.selectedOperation);
  }

  resetMap(): void {
    this.showAnalysisForm = false;
    this.analysisResult = null;
    this.mapService.clearAnalysisResult();
    this.mapService.sendResetRequest();
  }

  downloadExcel(): void {
    if (!this.analysisResult) return alert("Önce analiz yapmalısınız.");
    this.reportService.exportToExcel(this.analysisResult, "Alan_Analiz_Raporu");
  }

  async downloadPdf(): Promise<void> {
    if (!this.analysisResult) return alert("Önce analiz yapmalısınız.");
    try {
      const mapElement = document.getElementById("map");
      if (!mapElement) return;

      const canvas = await html2canvas(mapElement, { useCORS: true, scale: 2 });
      const imageData = canvas.toDataURL("image/png");

      const headers = ["ID", "İşlem", "Alan (m²)", "Tarih"];
      const rows = [[
        this.analysisResult.id || "-",
        this.analysisResult.operationType || "Bilinmiyor",
        `${this.analysisResult.area?.toFixed(2) || 0} m²`,
        new Date().toLocaleDateString()
      ]];
      this.reportService.exportToPdfWithImage(headers, rows, imageData, "Alan_Analiz_Raporu");
    } catch (error) {
      alert("PDF hatası oluştu.");
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}