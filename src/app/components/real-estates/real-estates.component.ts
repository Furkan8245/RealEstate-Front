import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RealEstateService } from "../../services/real-estate.service";
import { AuthService } from "../../models/authService";
import { MapInteractionService } from "../../services/map-interaction.service";

@Component({
  selector: "app-real-estate-list",
  templateUrl: "./real-estate.component.html",
  styleUrls: ["./real-estate.component.css"],
  standalone: true,
  imports: [CommonModule],
})
export class RealEstateListComponent implements OnInit {
  estates: any[] = [];
  allEstates: any[] = [];

  isAdmin: boolean = false;

  selectedLocation = {
    city: "",
    district: "",
    neighborhood: "",
  };

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
    this.isAdmin=this.authService.isAdmin();
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

        this.selectedLocation = {
          city: filter.cityName || "",
          district: filter.districtName || "",
          neighborhood: filter.neighborhoodName || "",
        };

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

  deleteEstate(id: number): void {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;

    this.reService.deleteRealEstate(id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.estates = this.estates.filter((x) => x.realEstateId !== id);
          this.allEstates = this.allEstates.filter((x) => x.realEstateId !== id);
        }
      },
    });
  }
}
