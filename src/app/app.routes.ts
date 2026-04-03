import { Routes } from '@angular/router';
import { AreaAnalysisComponent } from './components/area-analysis/area-analysis.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { RealEstateListComponent } from './components/real-estates/real-estates.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';

export const routes: Routes = [
  // 1. Herkesin erişebileceği (Public) sayfalar
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "forgot-password", component: ForgotPasswordComponent },
  { path: "reset-password", component: ResetPasswordComponent },

  // 2. Korumalı (Protected) sayfalar - authGuard ile korunuyor
  { path: "analysis", component: AreaAnalysisComponent, canActivate: [authGuard] },
  { path: "real-estates", component: RealEstateListComponent, canActivate: [authGuard] },
  { path: "users", component: UserListComponent, canActivate: [authGuard] },
  { path: 'audit-log', component: AuditLogComponent, canActivate: [authGuard] },

  // 3. Yönlendirmeler (HİERARŞİ GEREĞİ EN SONDA OLMALI)
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "**", redirectTo: "login", pathMatch: "full" }
];