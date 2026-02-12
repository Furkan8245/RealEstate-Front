import { Routes } from '@angular/router';
import { AreaAnalysisComponent } from './components/area-analysis/area-analysis.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { RealEstateListComponent } from './components/real-estates/real-estates.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { UserListComponent } from './components/user-list/user-list.component';

export const routes: Routes = [
 { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "analysis", component: AreaAnalysisComponent, canActivate: [authGuard] },
  { path: "real-estates", component: RealEstateListComponent, canActivate: [authGuard] },
  { path: "users", component: UserListComponent, canActivate: [authGuard] },
    { path: 'admin/logs', component: AuditLogComponent, canActivate: [authGuard] },
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "**", redirectTo: "login", pathMatch: "full" },

];
