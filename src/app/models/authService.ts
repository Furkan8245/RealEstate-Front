import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LoginModel } from "./loginModel";
import { SingleResponseModel } from "./singleResponseModel";
import { TokenModel } from "./tokenModel";
import { RegisterModel } from "./registerModel";
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl = 'https://localhost:7241/api/auth/';
  constructor(private httpClient: HttpClient) {}

  register(registerModel: RegisterModel) {
    return this.httpClient.post<SingleResponseModel<TokenModel>>(this.apiUrl + 'register', registerModel);
  }

  login(loginModel: LoginModel) {
    return this.httpClient.post<SingleResponseModel<TokenModel>>(this.apiUrl + 'login', loginModel);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }
  getUserRole():string{
    const roles=this.getUserRoles();
    if (!roles||roles.length===0) {
      return "User";
    }
    return roles[0];
  }

  getUserRoles(): string[] {
  const token = this.getToken();
  if (!token) return [];

  try {
    const decoded: any = jwtDecode(token);

    const roles =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      || decoded.role;

    if (!roles) return [];

    return Array.isArray(roles) ? roles : [roles];

  } catch (error) {
    console.error("Token decode edilemedi:", error);
    return [];
  }
}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || 
             decodedToken.nameid || 
             decodedToken.id || 
             null;
    } catch (error) {
      console.error("Token decode hatası:", error);
      return null;
    }
  }
  isAdmin():boolean{
    const roles=this.getUserRoles();
    return roles.some(role=>role.toLowerCase()==='admin');
  }
}