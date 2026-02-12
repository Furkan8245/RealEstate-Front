import { Component, OnInit, OnDestroy, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { MenuItem } from "../../models/menu-item";
import { AuthService } from "../../models/authService";
import { MapInteractionService } from "../../services/map-interaction.service";
import { ReportService } from "../../services/report.service";
import html2canvas from "html2canvas";
import { AreaFormatPipe } from "../../pipes/area.pipe";
import { LocationSelectorComponent } from "../location/location-selector.component";
import { jwtDecode } from "jwt-decode";
import { RealEstateService } from "../../services/real-estate.service";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AreaFormatPipe, LocationSelectorComponent],
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() locationChanged = new EventEmitter<any>(); //sidebarın harita bileşenine veri fırlatmasını sağladık.
  menuItems: MenuItem[] = [
    { label: "Taşınmazlar", icon: "fa-user-o", route: "/real-estates", roles: ["Admin", "User"] },
    { label: "Kullanıcı Türleri", icon: "fa-clone", route: "/user-types", roles: ["Admin"] },
    { label: "Operasyon Türleri", icon: "fa-star-o", route: "/ops", roles: ["Admin"] },
  ];

  isAdmin:boolean=false;

  currentLocation: any = {
    cityId: 0,
    districtId: 0,
    neighborhoodId: 0
  };

  filteredMenu: MenuItem[] = [];
  showAnalysisForm: boolean = false;
  selectedOperation: string = "intersectionab";
  analysisResult: any = null;
  pointsCount: number = 0;
  private destroy$ = new Subject<void>();
  cities:any[]=[];
  districts:any[]=[];
  neighborhoods:any[]=[];
  selectedCityId:number=0;
  selectedDistrictId:number=0;
  selectedNeighborhoodId:number=0;

  constructor(
    private authService: AuthService,
    private mapService: MapInteractionService,
    private reportService: ReportService,
    private realEstateService:RealEstateService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.loadMenuByRole();
    this.listenPointsCount();
    this.listenAnalysisResult();
    this.checkAdminStatus();
    this.loadCities();
  }
  showRealEstates():void{
    this.router.navigate(["/real-estates"]);
  }
  
  loadCities() {
    this.realEstateService.getCities().subscribe({
      next:(response)=>{
        if(response?.success){
          this.cities=response.data;
        }
      },
      error:()=>alert("Şehirler bulunamadı.")
    });
  }

  handleLocationFilter(location: any): void {
    this.currentLocation = location;
    console.log("Seçilen Konum:", this.currentLocation);
    this.locationChanged.emit(location);
    this.mapService.setLocationFilter(location);
  }

  private loadMenuByRole(): void {
    const userRole = this.authService.getUserRole();

  this.filteredMenu = this.menuItems.filter((item) =>
    item.roles.includes(userRole)
  );
  }

  private listenPointsCount(): void {
    this.mapService.pointsCount$.pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.pointsCount = count;
    });
  }

  private listenAnalysisResult(): void {
    this.mapService.analysisResult$.pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.analysisResult = response;
    });
  }

  toggleAnalysisForm(): void {
    if (!this.showAnalysisForm && this.pointsCount < 3) {
      alert("Gereklilik: Analiz ayarlarını açabilmek için 3 poligon eklemek gerekir.");
      return;
    }
    this.showAnalysisForm = !this.showAnalysisForm;
  }

  executeAnalysis(): void {
    if (this.pointsCount < 3) {
      alert("Eksik poligon var!");
      return;
    }
    this.mapService.sendAnalysisRequest(this.selectedOperation);
  }

  resetMap(): void {
    this.showAnalysisForm = false;
    this.analysisResult = null;
    this.pointsCount = 0;
    this.currentLocation = { cityId: 0, districtId: 0, neighborhoodId: 0 };
    this.mapService.clearAnalysisResult();
    this.mapService.sendResetRequest();
  }

  downloadExcel(): void {
    if (!this.analysisResult) {
      alert("Önce analiz yapılması gerekmektedir.");
      return;
    }
    this.reportService.exportToExcel(this.analysisResult, "Alan_Analiz_Raporu");
  }

  async downloadPdf(): Promise<void> {
    try {
      if (!this.analysisResult) {
        alert("Önce analiz yapılması gerekmektedir.");
        return;
      }

      const mapElement = document.getElementById("map");
      if (!mapElement) return;

      const htmlCanvas = await html2canvas(mapElement, { useCORS: true, scale: 2 });
      const imageData = htmlCanvas.toDataURL("image/png");

      const headers = ["ID", "İşlem Tipi", "Alan (m²)", "Tarih"];
      const datas = [[
        this.analysisResult.id || "-",
        this.analysisResult.operationType || "Bilinmiyor",
        (this.analysisResult.area ? this.analysisResult.area.toFixed(2) : "0") + " m²",
        this.analysisResult.createdDate ? new Date(this.analysisResult.createdDate).toLocaleDateString() : new Date().toLocaleDateString()
      ]];

      this.reportService.exportToPdfWithImage(headers, datas, imageData, "Alan_Analiz_Raporu");
    } catch (error) {
      alert("PDF oluşturulurken hata oluştu!");
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  checkAdminStatus():void{
    this.isAdmin=this.authService.isAdmin();
   
  }

  
}
