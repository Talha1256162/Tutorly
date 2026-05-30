import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <header class="fixed top-0 inset-x-0 z-50">
      <div class="ref-navbar-frame">
        <div class="glass-strong ref-navbar-panel flex items-center shadow-card">
          <a routerLink="/" class="flex items-center gap-2 group">
            <div class="relative ref-logo-icon bg-primary-gradient grid place-items-center shadow-glow">
              <app-icon name="sparkles" className="ref-logo-symbol text-primary-foreground" />
            </div>
            <span class="font-display font-bold ref-logo-text tracking-tight">Mentora</span>
          </a>
          <nav class="hidden lg:flex items-center gap-7 text-sm text-muted-foreground ml-4">
            @if (isTutor) {
              <a routerLink="/tutor-dashboard" routerLinkActive="text-foreground" class="hover:text-foreground transition-colors">Teacher Portal</a>
              <a routerLink="/messages" routerLinkActive="text-foreground" class="hover:text-foreground transition-colors">Student Messages</a>
              <a routerLink="/tutors" routerLinkActive="text-foreground" class="hover:text-foreground transition-colors">Marketplace</a>
            } @else if (isLearner) {
              <a routerLink="/tutors" routerLinkActive="text-foreground" class="hover:text-foreground transition-colors">Find Tutors</a>
              <a routerLink="/insight/diagnostic" routerLinkActive="text-foreground" class="hover:text-foreground transition-colors">Insight</a>
              <a routerLink="/saved-tutors" routerLinkActive="text-foreground" class="hover:text-foreground transition-colors">Saved Tutors</a>
              <a routerLink="/my-bookings" routerLinkActive="text-foreground" class="hover:text-foreground transition-colors">My Demos</a>
              <a routerLink="/messages" routerLinkActive="text-foreground" class="hover:text-foreground transition-colors">Messages</a>
            } @else {
              <a routerLink="/tutors" routerLinkActive="text-foreground" class="hover:text-foreground transition-colors">Find Tutors</a>
              <a routerLink="/role" class="hover:text-foreground transition-colors">Become a Tutor</a>
              <a routerLink="/" fragment="how" class="hover:text-foreground transition-colors">How It Works</a>
              <a routerLink="/" fragment="pricing" class="hover:text-foreground transition-colors">Pricing</a>
              <a routerLink="/" fragment="stories" class="hover:text-foreground transition-colors">Success Stories</a>
            }
          </nav>
          <div class="ml-auto flex items-center gap-2">
            @if (isTutor) {
              <span class="hidden md:inline-flex text-sm text-muted-foreground px-3 py-2">{{ userName }}</span>
              <a routerLink="/tutor-dashboard" class="ref-find-button inline-flex items-center gap-2 rounded-xl bg-primary-gradient font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition">
                <span class="ref-dashboard-full">Teacher Dashboard</span>
                <span class="ref-dashboard-short">Dashboard</span>
              </a>
              <button type="button" class="ref-logout-button" aria-label="Logout" title="Logout" (click)="logout()">
                <app-icon name="log-out" className="h-4 w-4" />
                <span class="ref-logout-label">Logout</span>
              </button>
            } @else if (isLearner) {
              <span class="hidden md:inline-flex text-sm text-muted-foreground px-3 py-2">{{ userName }}</span>
              <a routerLink="/dashboard" class="ref-find-button inline-flex items-center gap-2 rounded-xl bg-primary-gradient font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition">
                <span class="ref-dashboard-full">Learner Dashboard</span>
                <span class="ref-dashboard-short">Dashboard</span>
              </a>
              <button type="button" class="ref-logout-button" aria-label="Logout" title="Logout" (click)="logout()">
                <app-icon name="log-out" className="h-4 w-4" />
                <span class="ref-logout-label">Logout</span>
              </button>
            } @else {
              <a routerLink="/login" class="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground px-3 py-2">Login</a>
              <a routerLink="/tutors" class="ref-find-button inline-flex items-center gap-2 rounded-xl bg-primary-gradient font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition">Find My Tutor</a>
            }
            <button type="button" class="ref-menu-button lg:hidden text-foreground" [attr.aria-expanded]="menuOpen" aria-label="Menu" (click)="toggleMenu()">
              <app-icon name="menu" className="ref-menu-symbol" />
            </button>
          </div>
        </div>
        @if (menuOpen) {
          <nav class="ref-mobile-drawer lg:hidden glass-strong shadow-card" aria-label="Mobile menu">
            @if (isTutor) {
              <a routerLink="/tutor-dashboard" routerLinkActive="text-foreground" (click)="closeMenu()">Teacher Portal</a>
              <a routerLink="/messages" routerLinkActive="text-foreground" (click)="closeMenu()">Student Messages</a>
              <a routerLink="/tutors" routerLinkActive="text-foreground" (click)="closeMenu()">Marketplace</a>
            } @else if (isLearner) {
              <a routerLink="/dashboard" routerLinkActive="text-foreground" (click)="closeMenu()">Learner Dashboard</a>
              <a routerLink="/tutors" routerLinkActive="text-foreground" (click)="closeMenu()">Find Tutors</a>
              <a routerLink="/insight/diagnostic" routerLinkActive="text-foreground" (click)="closeMenu()">Tutorly Insight</a>
              <a routerLink="/saved-tutors" routerLinkActive="text-foreground" (click)="closeMenu()">Saved Tutors</a>
              <a routerLink="/my-bookings" routerLinkActive="text-foreground" (click)="closeMenu()">My Demos</a>
              <a routerLink="/messages" routerLinkActive="text-foreground" (click)="closeMenu()">Messages</a>
            } @else {
              <a routerLink="/tutors" routerLinkActive="text-foreground" (click)="closeMenu()">Find Tutors</a>
              <a routerLink="/role" (click)="closeMenu()">Become a Tutor</a>
              <a routerLink="/login" (click)="closeMenu()">Login</a>
            }
          </nav>
        }
      </div>
    </header>
  `,
})
export class NavbarComponent {
  menuOpen = false;

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

  get userName(): string {
    return this.authService.currentUser?.fullName ?? '';
  }

  logout(): void {
    this.authService.clearSession();
    this.closeMenu();
    this.router.navigateByUrl('/login');
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
