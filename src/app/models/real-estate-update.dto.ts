export class RealEstateUpdateDto {
    id!: number;
    cityId!: number;
    districtId!: number;
    neighborhoodId!: number;
    cityName!: string;
    districtName!: string;
    neighborhoodName!: string;
    parcelNumber!: string;
    lotNumber!: string;
    address!: string;
    propertyTypeId!: number;
    coordinateX!: number;
    coordinateY!: number;
    area!: number;
    propertyName!: string;

    static fromEntity(entity: any): RealEstateUpdateDto {
        const dto = new RealEstateUpdateDto();
        
        dto.id = entity.realEstateId ?? 0;
        dto.cityId = entity.cityId ?? 0;
        dto.districtId = entity.districtId ?? 0;
        dto.neighborhoodId = entity.neighborhoodId ?? 0;
        dto.cityName = entity.cityName ?? "";
        dto.districtName = entity.districtName ?? "";
        dto.neighborhoodName = entity.neighborhoodName ?? "";
        dto.parcelNumber = entity.parcelNumber ?? "";
        dto.lotNumber = entity.lotNumber ?? "";
        dto.address = entity.address || "Adres belirtilmedi";
        dto.propertyTypeId = entity.propertyTypeId || entity.propertyId || 0;
        dto.area = entity.area ?? 0;
        dto.propertyName = entity.propertyName ?? "";

        if (entity.location && entity.location.coordinates) {
            dto.coordinateX=entity.location.coordinates[0];
            dto.coordinateY=entity.location.coordinates[1];

        }else{        
            dto.coordinateX=entity.coordinateX ?? 0;
            dto.coordinateY=entity.coordinateY ?? 0;
        }
        

        return dto;
    }
}