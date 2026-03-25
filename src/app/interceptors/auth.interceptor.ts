import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { error } from "three";

export const authInterceptor:HttpInterceptorFn=(request,next)=>{
    const router = inject(Router);
    const token=localStorage.getItem('token');
    if (token) {
        request=request.clone({
            setHeaders:{
                Authorization:`Bearer ${token}`
            }
        });
    }
    return next(request).pipe(
        catchError((error:HttpErrorResponse)=>{
            if (error.status ===401) {
                localStorage.removeItem('token');
                router.navigate(['/login']);
            }
            return throwError(()=>error);
        })
    );
};