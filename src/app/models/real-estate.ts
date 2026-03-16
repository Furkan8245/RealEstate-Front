export interface RealEstate {
  realEstateId: number;
  cityId: number;
  cityName: string;
  districtId: number;
  districtName: string;
  neighborhoodId: number;
  neighborhoodName: string;
  area: number;
  coordinateX: number;
  coordinateY: number;
  address: string;
  propertyName: string;
  description: string;
  userId?: number;
  name?: string;
  operationType?: string;
  geometryJson?: string;
  createdDate?: string | Date;
}