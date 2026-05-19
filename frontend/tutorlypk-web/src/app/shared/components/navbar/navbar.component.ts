import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
            <span class="font-display font-bold ref-logo-text tracking-tight">Lumora</span>
          </a>
          <nav class="hidden lg:flex items-center gap-7 text-sm text-muted-foreground ml-4">
            <a routerLink="/tutors" routerLinkActive="text-foreground" class="hover:text-foreground transition-colors">Find Tutors</a>
            <a routerLink="/role" class="hover:text-foreground transition-colors">Become a Tutor</a>
            <a routerLink="/" fragment="how" class="hover:text-foreground transition-colors">How It Works</a>
            <a routerLink="/" fragment="pricing" class="hover:text-foreground transition-colors">Pricing</a>
            <a routerLink="/" fragment="stories" class="hover:text-foreground transition-colors">Success Stories</a>
          </nav>
          <div class="ml-auto flex items-center gap-2">
            <a routerLink="/login" class="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground px-3 py-2">Login</a>
            <a routerLink="/tutors" class="ref-find-button inline-flex items-center gap-2 rounded-xl bg-primary-gradient font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition">Find My Tutor</a>
            <button class="ref-menu-button lg:hidden text-foreground" aria-label="Menu">
              <app-icon name="menu" className="ref-menu-symbol" />
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {}
