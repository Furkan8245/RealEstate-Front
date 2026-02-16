import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../models/authService";

export const authGuard: CanActivateFn = (route, state) => {
const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(["/login"]);
    return false;
  }

  const url = state.url.toLowerCase();
  const isAdminRoute = url.includes('admin') || url.includes('users');

 

  if (isAdminRoute && authService.isAdmin()) {
   
    console.warn("Yetkisiz erişim:Admin değilsiniz.");
    router.navigate(["/real-estates"]);
    return false;
   
  }

  return true;
};