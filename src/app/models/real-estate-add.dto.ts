export interface RealEstateAddDto {
    ownerId: number;
    cityId: number; 
    cityName?: string;
    districtId: number;
    districtName?: string;
    neighborhoodId: number;
    neighborhoodName?: string;
    propertyTypeId: number;
    propertyTypeName?: string;
    area: number;
    parcelNumber: string;
    lotNumber: string;
    coordinateX: number;
    coordinateY: number;
    createdDate: Date;
}