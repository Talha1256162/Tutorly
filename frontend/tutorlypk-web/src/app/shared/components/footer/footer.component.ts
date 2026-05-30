import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <footer class="relative mt-32 border-t border-white/5">
      <div class="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-4 gap-10 text-sm">
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="h-8 w-8 rounded-xl bg-primary-gradient grid place-items-center">
              <app-icon name="sparkles" className="h-4 w-4 text-primary-foreground" />
            </div>
            <span class="font-display font-bold text-lg">Mentora</span>
          </div>
          <p class="text-muted-foreground">Pakistan's Premium AI Tutor Marketplace.</p>
        </div>
        <div>
          <h4 class="font-semibold mb-3">Students</h4>
          <ul class="space-y-2 text-muted-foreground">
            <li><a routerLink="/tutors" class="footer-link">Find Tutors</a></li>
            <li><a routerLink="/dashboard" class="footer-link">Student Dashboard</a></li>
            <li><a routerLink="/" fragment="how" class="footer-link">How It Works</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-3">Tutors</h4>
          <ul class="space-y-2 text-muted-foreground">
            <li><a routerLink="/role" class="footer-link">Join as Tutor</a></li>
            <li><a routerLink="/tutor-dashboard" class="footer-link">Tutor Dashboard</a></li>
            <li><a routerLink="/" fragment="pricing" class="footer-link">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-3">Company</h4>
          <ul class="space-y-2 text-muted-foreground">
            <li><span class="footer-link footer-link--static">About</span></li>
            <li><span class="footer-link footer-link--static">Trust & Safety</span></li>
            <li><span class="footer-link footer-link--static">Contact</span></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">© 2026 Mentora. Made with care in Pakistan.</div>
    </footer>
  `,
})
export class FooterComponent {}
