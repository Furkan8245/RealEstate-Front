import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RealEstateService } from "../../services/real-estate.service";
import { AuthService } from "../../models/authService";
import { MapInteractionService } from "../../services/map-interaction.service";
import { DeleteConfirmModalComponent } from "../delete-confirm-modal/delete-confirm-modal.component";
import { EditRealEstateModalComponent } from "../edit-real-estate-modal/edit-real-estate-modal.component";
import { RealEstateUpdateDto } from "../../models/real-estate-update.dto";

@Component({
  selector: "app-real-estate-list",
  templateUrl: "./real-estate.component.html",
  styleUrls: ["./real-estate.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule,DeleteConfirmModalComponent,EditRealEstateModalComponent],
})
export class RealEstateListComponent implements OnInit {
  estates: any[] = [];
  allEstates: any[] = [];

  isDeleteModalOpen:boolean=false;
  selectedEstateForDelete:any=null;

  isEditModalOpen:boolean=false;
  selectedEstateForEdit:any=null;

  isAdmin: boolean = false;

  searchText: string = "";

  selectedEstateIds: Set<number> = new Set<number>();
  isAllSelected: boolean = false;

  constructor(
    private reService: RealEstateService,
    private authService: AuthService,
    private mapService: MapInteractionService
  ) {}

  ngOnInit(): void {
    this.checkRole();
    this.loadEstates();
    this.listenLocationFilter();
  }

  private checkRole(): void {
    this.isAdmin = this.authService.isAdmin();
  }

  openDeleteModal(estate:any):void{
    this.selectedEstateForDelete={
      id:estate.realEstateId,
      name: `${estate.cityName} / ${estate.districtName} / ${estate.neighborhoodName}`
    };
    this.isDeleteModalOpen=true;
  }
  openEditModal(estate:any):void{
    this.selectedEstateForEdit={...estate}; //kaydetmeden önce düzenleyeceğimiz veri değişmesin diye"{...estate}"
    this.isEditModalOpen=true;
  }

  confirmDelete():void {
    if (!this.selectedEstateForDelete) return;
    
    const id=this.selectedEstateForDelete.id;
   
    this.reService.deleteRealEstate(id).subscribe({
      next:(response) => {
        if(response?.success){
          this.estates = this.estates.filter((f)=>f.realEstateId !== id);
          this.allEstates=this.allEstates.filter((f)=>f.realEstateId !== id);
          this.selectedEstateIds.delete(id);

          this.isDeleteModalOpen=false;
          this.selectedEstateForDelete=null;
          
        }
      },
      error:(err)=>{
        console.error("Silme işleminde hata oluştu.",err);
        this.isDeleteModalOpen=false;
      },
    });
  }
  confirmEdit(updateData: any): void {
  const updateDto = RealEstateUpdateDto.fromEntity(updateData);

  this.reService.updateRealEstate(updateDto).subscribe({
    next: (response) => {
      if (response?.success) {
        this.loadEstates();
        console.log("Veritabanı");
        this.closeEditModal();
        this.selectedEstateForEdit = null;
        console.log("Güncelleme veritabanında başarılı...");
      }
    },
    error: (err) => {
      console.error("Güncelleme hatası:", err);
      const errorMessage = err.error?.message || "Güncelleme başarısız.";
      alert("Hata: " + errorMessage);
    }
  });
}
  closeEditModal():void{
    this.isEditModalOpen=false;
    this.selectedEstateForEdit=null;
  }
  private loadEstates(): void {
    const request = this.isAdmin
      ? this.reService.getAllRealEstates()
      : this.reService.getMyRealEstates();

    request.subscribe({
      next: (res) => {
        if (res?.success) {
          this.estates = res.data;
          this.allEstates = res.data;
        }
      },
      error: (err) => console.error("Taşınmaz yükleme hatası:", err),
    });
  }

  private listenLocationFilter(): void {
    this.mapService.locationFilter$.subscribe({
      next: (filter) => {
        if (!filter) return;
        this.applyFilter(filter);
      },
    });
  }

  private applyFilter(filter: any): void {
    this.estates = this.allEstates.filter((item) => {
      const cityMatch =
        filter.cityId === 0 || item.cityId === filter.cityId;

      const districtMatch =
        filter.districtId === 0 || item.districtId === filter.districtId;

      const neighborhoodMatch =
        filter.neighborhoodId === 0 ||
        item.neighborhoodId === filter.neighborhoodId;

      return cityMatch && districtMatch && neighborhoodMatch;
    });
  }

  onSearchChange(): void {
    try {
      const query = this.searchText.trim().toLowerCase();

      if (!query) {
        this.estates = [...this.allEstates];
        return;
      }

      this.estates = this.allEstates.filter((estate) =>
        (estate.cityName || "").toLowerCase().includes(query) ||
        (estate.districtName || "").toLowerCase().includes(query) ||
        (estate.neighborhoodName || "").toLowerCase().includes(query)
      );
    } catch (error) {
      console.error("Search error:", error);
    }
  }

  toggleSelectAll(): void {
    try {
      this.isAllSelected = !this.isAllSelected;

      if (this.isAllSelected) {
        this.estates.forEach((estate) =>
          this.selectedEstateIds.add(estate.realEstateId)
        );
      } else {
        this.selectedEstateIds.clear();
      }
    } catch (error) {
      console.error("Select all error:", error);
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
