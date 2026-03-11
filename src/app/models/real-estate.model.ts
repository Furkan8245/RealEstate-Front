export interface RealEstateSaveDto{
    cityId: number | null;
    cityName:string;
    districtName:string;
    neighborhoodName:string;
    propertyName:string;
    parcelNumber:string;
    lotNumber:string;
    area:number;
    coordinateX:number;
    coordinateY:number;
    ownerId:number;
    description:string;
}