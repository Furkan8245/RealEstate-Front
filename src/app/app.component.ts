import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
// 1. BackgroundComponent'in doğru yoldan import edildiğinden emin ol
import { BackgroundComponent } from './shared/background/background.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, BackgroundComponent], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}

  isAuthPage(): boolean {
    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const currentUrl = this.router.url;
    
    return authRoutes.some(route => currentUrl.includes(route)) || currentUrl === '/';
  }
}