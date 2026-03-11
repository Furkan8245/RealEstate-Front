import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { MapUtils } from "../utils/map.utils";

@Injectable({
  providedIn: "root",
})
export class RealEstateService {
  private readonly apiUrl = "https://localhost:7241/api/RealEstates";
  private readonly cityUrl = "https://localhost:7241/api/City";
  private readonly districtUrl = "https://localhost:7241/api/District";
  private readonly neighborhoodUrl = "https://localhost:7241/api/Neighborhood";

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getCities(): Observable<any> {
    return this.http.get(`${this.cityUrl}/getall`, { headers: this.getHeaders() });
  }

  getDistricts(cityId?: number): Observable<any> {
    const url = cityId ? `${this.districtUrl}/getbycity?cityId=${cityId}` : `${this.districtUrl}/getall`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getNeighborhoods(districtId?: number): Observable<any> {
    const url = districtId ? `${this.neighborhoodUrl}/getbydistrict?districtId=${districtId}` : `${this.neighborhoodUrl}/getall`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getAllRealEstates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getall`, { headers: this.getHeaders() });
  }

  getMyRealEstates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getmine`, { headers: this.getHeaders() });
  }

  saveRealEstate(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, data, { headers: this.getHeaders() });
  }

  updateRealEstate(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, data, { headers: this.getHeaders() });
  }
  prepareAnalysisPayload(result:any,location:any,userId:string,userRole:string,operationType:string){
    const [x,y]=MapUtils.getFirstCoordinates(result.geometry);
    return{
      cityId:null,
      districtId:null,
      neighborhoodId:null,
      cityName:location.cityName,
      districtName:location.districtName,
      neighborhoodName:location.neighborhoodName,
      propertyName:`Analiz-${operationType.toUpperCase()}`,
      parcelNumber:Math.floor(Math.random()*999).toString(),
      lotNumber:operationType,
      area:Number(result.area),
      address:`${location.cityName} / ${location.districtName}`,
      propertyTypeId:1,
      ownerId:Number(userId),
      coordinateX:x,
      coordinateY:y,
      description: `${userRole.toUpperCase()} Analizi: ${operationType}`
    };
  }

  deleteRealEstate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete?realEstateId=${id}`, {
      headers: this.getHeaders(),
      body: { id: id }
    });
  }
}