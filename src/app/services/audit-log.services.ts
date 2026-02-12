import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private apiUrl = 'https://localhost:7241/api/AuditLogs'; 

  constructor(private http: HttpClient) {}

  getAllLogs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getall`);
  }
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiration = payload.exp * 1000;
        return Date.now() < expiration;
    } catch {
        return false;
    }
}

getUserRole(): string | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ;
    } catch {
        return null;
    }
}
}