import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AreaAnalysis } from '../models/areaAnalysis';
import { Injectable } from '@angular/core';

// Engin Hoca Standart Response Yapısı
export interface SingleResponseModel<T> {
  data: T;
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  apiUrl = 'https://localhost:7241/api/AreaAnalysis/';

  constructor(private httpClient: HttpClient) {}

  // Swagger'daki POST /calculate işlemi
  calculate(payload: any): Observable<SingleResponseModel<AreaAnalysis>> {
    return this.httpClient.post<SingleResponseModel<AreaAnalysis>>(this.apiUrl + 'calculate', payload);
  }
}