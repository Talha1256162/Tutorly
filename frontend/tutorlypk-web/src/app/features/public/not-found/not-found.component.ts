import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="mx-auto max-w-5xl px-6 py-10">
      <div class="not-found-panel glass-strong shadow-card">
        <div class="premium-kicker"><app-icon name="search" className="h-3.5 w-3.5" /> Page not found</div>
        <h1 class="font-display text-4xl sm:text-6xl font-bold tracking-tight mt-5">This page is not available.</h1>
        <p class="text-muted-foreground text-lg mt-4 max-w-2xl">
          The link may be old, mistyped, or moved during the latest Mentora update.
        </p>
        <div class="mt-8 flex flex-col sm:flex-row gap-3">
          <a routerLink="/tutors" class="premium-btn premium-btn--primary">Browse tutors</a>
          <a routerLink="/" class="premium-btn premium-btn--secondary">Back home</a>
        </div>
      </div>
    </section>
  `,
})
export class NotFoundComponent {}
