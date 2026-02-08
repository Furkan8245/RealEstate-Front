import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {

  private apiUrl = 'https://localhost:7241/api/AreaAnalysis';
  constructor(private http:HttpClient) { }
  calculate(analysisData:any):Observable<any>{
    return this.http.post(`${this.apiUrl}/calculate`,analysisData);
  }
}
