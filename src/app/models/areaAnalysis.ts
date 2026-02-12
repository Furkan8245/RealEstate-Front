export interface AreaAnalysis {
  id?: number;
  name: string;
  description: string;
  area: number;
  operationType: string;
  geometry: any;
  createdDate?: Date;
}