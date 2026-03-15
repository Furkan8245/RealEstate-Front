export interface City{
    id:number;
    name:string;
}
export interface District{
    id:number;
    name:string;
}
export interface Neighborhood{
    id:number;
    name:string;
}
export interface LocationInfo{
    cityName:string;
    districtName:string;
    neighborhoodName:string;
    cityId?:number|null;
    districtId?:number|null;
    neighborhoodId?:number|null;
}