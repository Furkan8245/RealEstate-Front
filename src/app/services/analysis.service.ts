import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AreaAnalysis } from '../models/areaAnalysis';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface SingleResponseModel<T> {
  data: T;
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  apiUrl = `${environment.apiBaseUrl}/AreaAnalysis`;

  constructor(private httpClient: HttpClient) {}


  calculate(payload: any): Observable<SingleResponseModel<AreaAnalysis>> {
    if (!payload) {
      return throwError(()=>new Error("Analiz için veri sağlanmadı."));
    }
    return this.httpClient
    .post<SingleResponseModel<AreaAnalysis>>(`${this.apiUrl}/calculate`,payload)
    .pipe(
      catchError(this.handleError)
    );
  }
  private handleError(error:any){
    console.error('Analiz sırasında hata meydana geldi:',error);
    return throwError(()=>new Error(error.message || 'Sunucu hatası.'));
  }
}