import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { MapUtils } from "../utils/map.utils";
import { RealEstateSaveDto } from "../models/real-estate.model";
import { environment } from "../../environments/environment";
import { City, District, LocationInfo, Neighborhood } from "../models/location.model";
import { RealEstate } from "../models/real-estate";

@Injectable({
  providedIn: "root",
})
export class RealEstateService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getCities(): Observable<City[]> {
    return this.http.get<City[]>(`${this.baseUrl}/City/getall`);
  }

  getDistricts(cityId?: number): Observable<District[]> {
    const url = cityId 
      ? `${this.baseUrl}/District/getbycity?cityId=${cityId}` 
      : `${this.baseUrl}/District/getall`;
    return this.http.get<District[]>(url);
  }

  getNeighborhoods(districtId?: number): Observable<Neighborhood[]> {
    const url = districtId 
      ? `${this.baseUrl}/Neighborhood/getbydistrict?districtId=${districtId}` 
      : `${this.baseUrl}/Neighborhood/getall`;
    return this.http.get<Neighborhood[]>(url);
  }

  getAllRealEstates(): Observable<RealEstate[]> {
    return this.http.get<RealEstate[]>(`${this.baseUrl}/RealEstates/getall`);
  }

  getMyRealEstates(): Observable<RealEstate[]> {
    return this.http.get<RealEstate[]>(`${this.baseUrl}/RealEstates/getmine`);
  }

  saveRealEstate(data: RealEstateSaveDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/RealEstates/add`, data);
  }

  updateRealEstate(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/RealEstates/update`, data);
  }

  deleteRealEstate(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/RealEstates/delete?realEstateId=${id}`, {
      params:{realEstateId:id.toString()}
    });
  }

  prepareAnalysisPayload(
    result: any, 
    location: LocationInfo, 
    userId: string, 
    userRole: string, 
    operationType: string
  ): RealEstateSaveDto {
    const [x, y] = MapUtils.getFirstCoordinates(result.geometry);

    return {
      cityId: location.cityId || null,
      districtId: location.districtId || null,
      neighborhoodId: location.neighborhoodId || null,
      cityName: location.cityName,
      districtName: location.districtName,
      neighborhoodName: location.neighborhoodName,
      propertyName: `Analiz-${operationType.toUpperCase()}`,
      parcelNumber: Math.floor(Math.random() * 999).toString(),
      lotNumber: operationType,
      area: Number(result.area),
      address: `${location.cityName} / ${location.districtName} / ${location.neighborhoodName}`,
      propertyTypeId: 1,
      ownerId: Number(userId),
      coordinateX: x,
      coordinateY: y,
      description: `${userRole.toUpperCase()} Analizi: ${operationType}`
    };
  }
}