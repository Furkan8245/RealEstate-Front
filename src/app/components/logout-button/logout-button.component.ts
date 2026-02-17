import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LOGOUT_BUTTON_STATES } from './logout-button.constants';
import { Router } from '@angular/router';


@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout-button.component.html',
  styleUrls: ['./logout-button.component.css']
})
export class LogoutButtonComponent {
  logoutButtonState=LOGOUT_BUTTON_STATES;
  currentState: string = 'default';
  isClicked: boolean = false;
  isDoorSlammed: boolean = false;
  isFalling: boolean = false;

  constructor(private router:Router){}

  onMouseEnter(): void {
    if (!this.isClicked) {
      this.currentState = 'hover';
    }
  }

  onMouseLeave(): void {
    if (!this.isClicked) {
      this.currentState = 'default';
    }
  }

  startAnimation(): void {
    if (this.isClicked) return;

    this.isClicked = true;
    this.currentState = 'walking1';

    setTimeout(() => {
      this.isDoorSlammed = true;
      this.currentState = 'walking2';

      setTimeout(() => {
        this.isFalling = true;
        this.currentState = 'falling1';

        setTimeout(() => {
          this.currentState = 'falling2';

          setTimeout(() => {
            this.currentState = 'falling3';

            setTimeout(() => {
              this.reset();
              localStorage.removeItem('token');
              this.router.navigate(['/login']);
              console.log('Çıkış yapıldı!');
            }, 1000);
          }, parseInt(this.logoutButtonState['falling2']['--walking-duration'] || '300'));
        }, parseInt(this.logoutButtonState['falling1']['--walking-duration'] || '400'));
      }, 400);
    }, 300);
  }

  private reset(): void {
    this.isClicked = false;
    this.isDoorSlammed = false;
    this.isFalling = false;
    this.currentState = 'default';
  }
}
