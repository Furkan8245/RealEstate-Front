import { Observable } from "rxjs";

export interface GeoLocation{
    lat:number;
    lng:number;
}
export abstract class GeocodingService{
    abstract getLocation(cityName:string, districtName:string,neighborhoodName:string):Observable<GeoLocation | null>;
}