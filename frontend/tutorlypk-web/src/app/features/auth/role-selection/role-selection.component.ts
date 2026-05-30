import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="role-shell">
      <div class="role-frame">
        <header class="glass-strong ref-navbar-panel flex items-center shadow-card">
          <a routerLink="/" class="auth-brand" aria-label="Mentora home">
            <span class="auth-brand-mark"><app-icon name="sparkles" className="h-5 w-5" /></span>
            <span class="text-xl">Mentora</span>
          </a>
          <a routerLink="/login" class="auth-link ml-auto">Sign in</a>
        </header>

        <main class="role-hero">
          <div class="premium-kicker mx-auto"><app-icon name="sparkles" className="h-3.5 w-3.5" /> Welcome to Mentora</div>
          <h1>Choose the workspace that fits your journey.</h1>
          <p>Students and parents get teacher matching, demos, Tutorly Insight, progress, and messages. Teachers get a focused portal for requests, availability, and families.</p>

          <div class="role-grid">
            <a routerLink="/register" [queryParams]="{ role: 'student' }" class="role-option">
              <span class="role-option-icon"><app-icon name="graduation-cap" className="h-6 w-6" /></span>
              <h3>Student / Parent</h3>
              <p>Find verified teachers, run Tutorly Insight, book demos, save tutors, and manage learning progress.</p>
              <span class="role-option-link">Continue to learner workspace <app-icon name="arrow-right" className="h-4 w-4" /></span>
            </a>

            <a routerLink="/register" [queryParams]="{ role: 'tutor' }" class="role-option">
              <span class="role-option-icon"><app-icon name="book-open" className="h-6 w-6" /></span>
              <h3>Teacher</h3>
              <p>Receive requests, manage availability, respond to families, and keep your teaching profile polished.</p>
              <span class="role-option-link">Open teacher portal <app-icon name="arrow-right" className="h-4 w-4" /></span>
            </a>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class RoleSelectionComponent {}
