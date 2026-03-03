import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, shareReplay } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class LocationService {
    private baseUrl='https://api.turkiyeapi.dev/v1';
    private provincesCache$?:Observable<any[]>;

    constructor(private http:HttpClient) {}

    getCities():Observable<any[]> {
        if (!this.provincesCache$) {
            this.provincesCache$=this.http.get<any>(`${this.baseUrl}/provinces`).pipe(
                map(res=>res.data),
                shareReplay(1)
            );
        }
        return this.provincesCache$!;
    }
    getDistricts(provinceId:number):Observable<any[]>{
        return this.http.get<any>(`${this.baseUrl}/provinces/${provinceId}`).pipe(
            map(res=>res.data.districts)
        );
    
    }
    getNeighborhoods(districtId:number):Observable<any[]>{
        return this.http.get<any>(`${this.baseUrl}/districts/${districtId}`).pipe(
            map(res=>res.data.neighborhoods)
        );
    }
}