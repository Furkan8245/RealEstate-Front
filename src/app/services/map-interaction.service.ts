import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MapInteractionService {

  private pointsCountSource = new BehaviorSubject<number>(0);
  pointsCount$ = this.pointsCountSource.asObservable();


  private analysisSource = new Subject<string>();
  analysisRequest$ = this.analysisSource.asObservable();

  private resetSource=new Subject<void>();
  resetRequest$=this.resetSource.asObservable();

  private analysisResultSource=new BehaviorSubject<any>(null);
  analysisResult$=this.analysisResultSource.asObservable();

  private locationFilterSubject =new BehaviorSubject<any>(null);
  locationFilter$ = this.locationFilterSubject.asObservable();

  updatePointsCount(count: number) {
    this.pointsCountSource.next(count);
  }

  sendAnalysisRequest(operation: string) {
    this.analysisSource.next(operation);
  }

  sendResetRequest():void{
    this.resetSource.next();
  }
  setAnalysisResult(result:any){
    this.analysisResultSource.next(result);
  }
  clearAnalysisResult(){
    this.analysisResultSource.next(null);
  }

  setLocationFilter(filter:any):void{
    this.locationFilterSubject.next(filter);
  }

}