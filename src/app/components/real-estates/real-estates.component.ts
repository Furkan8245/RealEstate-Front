import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { RealEstateService } from "../../services/real-estate.service";
import { AuthService } from "../../models/authService";
import { MapInteractionService } from "../../services/map-interaction.service";
import { DeleteConfirmModalComponent } from "../delete-confirm-modal/delete-confirm-modal.component";
import { EditRealEstateModalComponent } from "../edit-real-estate-modal/edit-real-estate-modal.component";
import { RealEstateUpdateDto } from "../../models/real-estate-update.dto";
import { EmptyStateComponent } from "../../shared/components/empty-state/empty-state.component";
import { AnimatedBgComponent } from "../../shared/components/animated-bg/animated-bg.component";
import { RealEstate } from "../../models/real-estate";

@Component({
  selector: "app-real-estate-list",
  templateUrl: "./real-estate.component.html",
  styleUrls: ["./real-estate.component.css"],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DeleteConfirmModalComponent, 
    EditRealEstateModalComponent, 
    EmptyStateComponent, 
    AnimatedBgComponent
  ],
})
export class RealEstateListComponent implements OnInit, OnDestroy {
  estates: RealEstate[] = [];
  allEstates: RealEstate[] = [];

  isDeleteModalOpen: boolean = false;
  selectedEstateForDelete: { id: number; name: string } | null = null;

  isEditModalOpen: boolean = false;
  selectedEstateForEdit: any = null; // Tip uyuşmazlığını çözmek için şimdilik any yapıldı

  isAdmin: boolean = false;
  searchText: string = "";
  selectedEstateIds: Set<number> = new Set<number>();
  isAllSelected: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private reService: RealEstateService,
    private authService: AuthService,
    private mapService: MapInteractionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkRole();
    this.loadEstates();
    this.listenLocationFilter();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkRole(): void {
    this.isAdmin = this.authService.isAdmin();
  }

  openDeleteModal(estate: any): void {
    this.selectedEstateForDelete = {
      id: estate.realEstateId,
      name: `${estate.cityName} / ${estate.districtName} / ${estate.neighborhoodName}`
    };
    this.isDeleteModalOpen = true;
  }

  openEditModal(estate: any): void {
    this.selectedEstateForEdit = { ...estate };
    this.isEditModalOpen = true;
  }

  confirmDelete(): void {
    if (!this.selectedEstateForDelete) return;
    
    const id = this.selectedEstateForDelete.id;
   
    this.reService.deleteRealEstate(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.estates = this.estates.filter((f) => f.realEstateId !== id);
            this.allEstates = this.allEstates.filter((f) => f.realEstateId !== id);
            this.selectedEstateIds.delete(id);
            this.isDeleteModalOpen = false;
            this.selectedEstateForDelete = null;
          }
        },
        error: (err) => {
          console.error("Silme hatası:", err);
          this.isDeleteModalOpen = false;
        },
      });
  }

  confirmEdit(updateData: any): void {
    const updateDto = RealEstateUpdateDto.fromEntity(updateData);

    this.reService.updateRealEstate(updateDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response?.success) {
            this.loadEstates();
            this.closeEditModal();
          }
        },
        error: (err) => {
          console.error("Güncelleme hatası:", err);
          alert("Hata: " + (err.error?.message || "Güncelleme başarısız."));
        }
      });
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedEstateForEdit = null;
  }

  private loadEstates(): void {
    const request = this.isAdmin
      ? this.reService.getAllRealEstates()
      : this.reService.getMyRealEstates();

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.estates = res.data;
          this.allEstates = res.data;
        }
      },
      error: (err) => console.error("Yükleme hatası:", err),
    });
  }

  private listenLocationFilter(): void {
    // locationFilter$ hatası için opsiyonel zincirleme veya mapService kontrolü
    if (this.mapService && (this.mapService as any).locationFilter$) {
      (this.mapService as any).locationFilter$
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (filter: any) => {
            if (filter) this.applyFilter(filter);
          },
        });
    }
  }

  private applyFilter(filter: any): void {
    this.estates = this.allEstates.filter((item: any) => {
      const cityMatch = filter.cityId === 0 || item.cityId === filter.cityId;
      const districtMatch = filter.districtId === 0 || item.districtId === filter.districtId;
      const neighborhoodMatch = filter.neighborhoodId === 0 || item.neighborhoodId === filter.neighborhoodId;
      return cityMatch && districtMatch && neighborhoodMatch;
    });
  }

  onSearchChange(): void {
    const query = this.searchText.trim().toLowerCase();
    if (!query) {
      this.estates = [...this.allEstates];
      return;
    }
    this.estates = this.allEstates.filter((estate: any) =>
      (estate.cityName || "").toLowerCase().includes(query) ||
      (estate.districtName || "").toLowerCase().includes(query) ||
      (estate.neighborhoodName || "").toLowerCase().includes(query)
    );
  }

  navigateToAnalysis(): void {
    this.router.navigate(['/analysis']);
  }

  toggleSelectAll(): void {
    this.isAllSelected = !this.isAllSelected;
    if (this.isAllSelected) {
      this.estates.forEach((estate: any) => this.selectedEstateIds.add(estate.realEstateId));
    } else {
      this.selectedEstateIds.clear();
    }
  }

  toggleRowSelection(id: number): void {
    if (this.selectedEstateIds.has(id)) {
      this.selectedEstateIds.delete(id);
      this.isAllSelected = false;
    } else {
      this.selectedEstateIds.add(id);
    }
  }
}