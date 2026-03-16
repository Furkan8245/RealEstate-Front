export interface RealEstateSaveDto{
cityId: number | null;
  districtId: number | null;
  neighborhoodId: number | null;
  cityName: string;
  districtName: string;
  neighborhoodName: string;
  propertyName: string;
  parcelNumber: string;
  lotNumber: string;
  area: number;
  address: string;
  propertyTypeId: number;
  ownerId: number;
  coordinateX: number;
  coordinateY: number;
  description: string;
}