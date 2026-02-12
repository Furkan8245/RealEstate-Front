export interface RealEstate {
    id: number;
    userId: string;
    name: string;
    operationType: string;
    area: number;
    geometryJson: string; 
    createdDate: Date;
}