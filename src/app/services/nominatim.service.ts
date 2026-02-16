import { Injectable } from "@angular/core";
import { GeocodingService, GeoLocation } from "../models/geo-location.service";
import { HttpClient } from "@angular/common/http";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({providedIn:'root'})
export class NominatimService extends GeocodingService{
    private readonly baseUrl='https://nominatim.openstreetmap.org/search';
    constructor(private http:HttpClient){
        super();
    }
    getLocation(cityName:string, districtName:string,neighborhoodName:string):Observable<GeoLocation | null>{
        const query = `${neighborhoodName}, ${districtName}, ${cityName}, Türkiye`;
        const url = `${this.baseUrl}?format=json&q=${encodeURIComponent(query)}&limit=1`;

        return this.http.get<any[]>(url).pipe(
            map(results=>{
                if (results && results.length > 0) {
                    return{
                        lat:parseFloat(results[0].lat),
                        lng:parseFloat(results[1].lon)
                    };
                }
                return null;
            }),
            catchError(()=>of(null))
        );
    }
}