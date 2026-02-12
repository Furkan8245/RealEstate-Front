import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class RealEstateService {

  private readonly apiUrl = "https://localhost:7241/api/RealEstates";

  private readonly cityUrl = "https://localhost:7241/api/City";
  private readonly districtUrl = "https://localhost:7241/api/District";
  private readonly neighborhoodUrl = "https://localhost:7241/api/Neighborhood";

  constructor(private http: HttpClient) {}


  getCities(): Observable<any> {
    return this.http.get(`${this.cityUrl}/getall`);
  }


  getDistricts(): Observable<any> {
    return this.http.get(`${this.districtUrl}/getall`);
  }

  getNeighborhoods(): Observable<any> {
    return this.http.get(`${this.neighborhoodUrl}/getall`);
  }


  getAllRealEstates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getall`);
  }

  getMyRealEstates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getmine`);
  }

  saveRealEstate(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, data);
  }

  deleteRealEstate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete`, {
      body: { realEstateId: id },
    });
  }
}
