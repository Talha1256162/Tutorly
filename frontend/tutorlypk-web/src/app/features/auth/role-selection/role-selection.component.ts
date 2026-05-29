import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="min-h-screen relative">
      <header class="fixed top-0 inset-x-0 z-50">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 pt-3">
          <div class="glass-strong rounded-2xl px-4 sm:px-5 py-3 flex items-center gap-6 shadow-card">
            <a routerLink="/" class="flex items-center gap-2"><div class="relative h-8 w-8 rounded-xl bg-primary-gradient grid place-items-center shadow-glow"><app-icon name="sparkles" className="h-4 w-4 text-primary-foreground" /></div><span class="font-display font-bold text-lg tracking-tight">Mentora</span></a>
          </div>
        </div>
      </header>
      <main class="pt-24 pb-28 lg:pb-0">
        <div class="mx-auto max-w-7xl px-6 py-16 text-center">
          <div class="inline-flex glass rounded-full px-3 py-1 text-xs text-cyan mb-4"><app-icon name="sparkles" className="h-3 w-3 mr-1" />WELCOME TO MENTORA</div>
          <h1 class="font-display text-4xl sm:text-5xl font-bold tracking-tight">Choose your role on <br /><span class="text-gradient">Mentora</span></h1>
          <p class="text-muted-foreground mt-4 max-w-2xl mx-auto">Students and parents find the right teacher together. Teachers use a separate portal to handle bookings, conversations, and earnings.</p>
          <div class="grid md:grid-cols-2 gap-5 mt-12 max-w-4xl mx-auto">
            <a routerLink="/register" [queryParams]="{ role: 'student' }" class="group relative glass-strong rounded-3xl p-9 text-left hover:bg-white/[0.06] transition-all hover:-translate-y-1 shadow-card overflow-hidden">
              <div class="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition"></div>
              <div class="relative"><div class="h-14 w-14 rounded-2xl bg-primary-gradient grid place-items-center shadow-glow"><app-icon name="graduation-cap" className="h-6 w-6 text-primary-foreground" /></div><h3 class="font-display text-2xl font-semibold mt-6">I'm a Student / Parent</h3><p class="text-muted-foreground mt-2">Find verified teachers, book demos, track learning progress, and chat securely.</p><div class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">Continue to learner workspace <app-icon name="arrow-right" className="h-4 w-4 group-hover:translate-x-1 transition" /></div></div>
            </a>
            <a routerLink="/register" [queryParams]="{ role: 'tutor' }" class="group relative glass-strong rounded-3xl p-9 text-left hover:bg-white/[0.06] transition-all hover:-translate-y-1 shadow-card overflow-hidden">
              <div class="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition"></div>
              <div class="relative"><div class="h-14 w-14 rounded-2xl bg-primary-gradient grid place-items-center shadow-glow"><app-icon name="book-open" className="h-6 w-6 text-primary-foreground" /></div><h3 class="font-display text-2xl font-semibold mt-6">I'm a Teacher</h3><p class="text-muted-foreground mt-2">Receive requests, manage availability, track earnings, and respond to families.</p><div class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">Teacher portal <app-icon name="arrow-right" className="h-4 w-4 group-hover:translate-x-1 transition" /></div></div>
            </a>
          </div>
          <a routerLink="/login" class="inline-block mt-10 text-sm text-muted-foreground hover:text-foreground">Already have an account? Sign in</a>
        </div>
      </main>
    </div>
  `,
})
export class RoleSelectionComponent {}
