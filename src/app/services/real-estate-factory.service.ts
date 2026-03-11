import { Injectable } from "@angular/core";
import { RealEstateSaveDto } from "../models/real-estate.model";

@Injectable({providedIn:'root'})
export class RealEstateFactoryService{
    createSavePayload(result:any,location:any,userId:number,operationType:string):RealEstateSaveDto{
        const coordinates=this.extractCoordinates(result.geometry);
        return{
            cityId:null,
            cityName:location.cityName,
            districtName:location.districtName,
            neighborhoodName:location.neighborhoodName,
            propertyName:`Analiz-${operationType.toUpperCase()}`,
            parcelNumber:Math.floor(Math.random()*999).toString(),
            lotNumber:operationType,
            area:Number(result.area),
            coordinateX:coordinates[0],
            coordinateY:coordinates[1],
            ownerId:userId,
            description:`Otomatik Analiz Kaydı`
        };
    }
    private extractCoordinates(geometry: any):[number,number]{ 
        return geometry.type === 'Point' ? geometry.coordinates:geometry.coordinates[0][0];
    }
}