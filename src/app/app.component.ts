import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BackgroundComponent } from './shared/background/background.component'; 
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, BackgroundComponent, SidebarComponent], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // URL her değiştiğinde Angular'ın sayfayı yeniden kontrol etmesini sağlar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isAuthPage();
    });
  }

  isAuthPage(): boolean {
  const currentUrl = this.router.url;

  return currentUrl.includes('login') || 
         currentUrl.includes('register') || 
         currentUrl.includes('forgot-password');
}
}