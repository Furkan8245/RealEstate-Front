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

  const userRoles = authService.getUserRoles();
  const adminRoutes = ["users", "logs"];

  const isAdminRoute = adminRoutes.some((path) =>
    state.url.includes(path)
  );

  if (isAdminRoute && !userRoles.includes("Admin")) {
    router.navigate(["/real-estates"]);
    return false;
  }

  return true;
};