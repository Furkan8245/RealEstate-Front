export interface GeometryDto{
    type:string;
    coordinates:any[];
}
export interface AnalysisPayload{
    geometryA:GeometryDto;
    geometryB:GeometryDto;
    geometryC:GeometryDto;
    operationType:string;
    description:string;
}
