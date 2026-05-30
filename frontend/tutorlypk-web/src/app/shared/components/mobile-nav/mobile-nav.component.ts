import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="ref-mobile-nav lg:hidden fixed inset-x-3 z-50 glass-strong rounded-2xl flex justify-around shadow-card">
      @if (isTutor) {
        <a routerLink="/tutor-dashboard" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="house" className="h-3.5 w-3.5" /></div>Portal
        </a>
        <a routerLink="/messages" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="message-circle" className="h-3.5 w-3.5" /></div>Students
        </a>
        <a routerLink="/tutors" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="search" className="h-3.5 w-3.5" /></div>Market
        </a>
        <button type="button" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground" aria-label="Logout" (click)="logout()">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="log-out" className="h-3.5 w-3.5" /></div>Logout
        </button>
      } @else if (isLearner) {
        <a routerLink="/dashboard" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="house" className="h-3.5 w-3.5" /></div>Home
        </a>
        <a routerLink="/tutors" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="search" className="h-3.5 w-3.5" /></div>Tutors
        </a>
        <a routerLink="/insight/diagnostic" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="sparkles" className="h-3.5 w-3.5" /></div>Insight
        </a>
        <a routerLink="/my-bookings" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="calendar" className="h-3.5 w-3.5" /></div>Demos
        </a>
        <a routerLink="/messages" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="message-circle" className="h-3.5 w-3.5" /></div>Messages
        </a>
        <button type="button" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground" aria-label="Logout" (click)="logout()">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="log-out" className="h-3.5 w-3.5" /></div>Logout
        </button>
      } @else {
        <a routerLink="/" routerLinkActive="text-foreground" [routerLinkActiveOptions]="{ exact: true }" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="house" className="h-3.5 w-3.5" /></div>Home
        </a>
        <a routerLink="/tutors" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="search" className="h-3.5 w-3.5" /></div>Tutors
        </a>
        <a routerLink="/role" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="sparkles" className="h-3.5 w-3.5" /></div>Join
        </a>
        <a routerLink="/login" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
          <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="user" className="h-3.5 w-3.5" /></div>Login
        </a>
      }
    </nav>
  `,
})
export class MobileNavComponent {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get isTutor(): boolean {
    return this.authService.currentUser?.role === 'tutor';
  }

  get isLearner(): boolean {
    const role = this.authService.currentUser?.role;
    return role === 'student' || role === 'parent';
  }

  logout(): void {
    this.authService.clearSession();
    this.router.navigateByUrl('/login');
  }
}
