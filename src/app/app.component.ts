import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { BackgroundComponent } from './shared/background/background.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, BackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}

  isAuthPage(): boolean {
    const url = this.router.url;
    // URL login, register içeriyorsa veya bomboşsa (root) auth sayfasındayız demektir
    return url.includes('login') || url.includes('register') || url === '/' || url === '';
  }
}