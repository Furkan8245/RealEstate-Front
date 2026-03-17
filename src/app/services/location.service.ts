import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, shareReplay } from "rxjs";
import { environment } from "../../environments/environment";
import { City, District, Neighborhood } from "../models/location.model";

@Injectable({
    providedIn: "root"
})
export class LocationService {
    private readonly baseUrl= environment.turkiyeApiUrl;
    private readonly provincesCache$=this.http.get<{data:City[]}>(`{this.baseUrl}/provinces`).pipe(
        map(res=>res.data),
        shareReplay(1)
    );

    constructor(private http:HttpClient) {}

    getCities():Observable<City[]>{
        return this.provincesCache$;
    }
    getDistricts(provinceId: number): Observable<District[]> {
        if (!provinceId) return new Observable(sub=>sub.next([]));
        return this.http.get<{ data:{districts:District[]}}>(`${this.baseUrl}/provinces/${provinceId}`).pipe(
            map(res=>res.data.districts)
        );
    }
    getNeighborhoods(districtId:number):Observable<Neighborhood[]>{
        if(!districtId) return new Observable(sub=>sub.next([]));
        return this.http.get<{data:{neighborhoods:Neighborhood[]}}>(`${this.baseUrl}/districts/${districtId}`).pipe(
            map(res=>res.data.neighborhoods)
        );
    }
}