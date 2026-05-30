import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent],
  template: `
    <main class="premium-auth">
      <div class="auth-grid">
        <section class="auth-showcase">
          <a routerLink="/" class="auth-brand" aria-label="Mentora home">
            <span class="auth-brand-mark"><app-icon name="sparkles" className="h-5 w-5" /></span>
            <span class="text-2xl">Mentora</span>
          </a>

          <div class="auth-copy">
            <div class="premium-kicker"><app-icon name="shield-check" className="h-3.5 w-3.5" /> Verified tutor marketplace</div>
            <h1>Match with a tutor who understands the exact learning gap.</h1>
            <p>Mentora brings diagnostic insight, verified teacher profiles, demos, messages, and parent-ready progress into one calm workspace.</p>

            <div class="auth-metrics">
              <div class="auth-metric"><strong>7k+</strong><span>families guided across Pakistan</span></div>
              <div class="auth-metric"><strong>92%</strong><span>parents shortlist faster after Insight</span></div>
              <div class="auth-metric"><strong>24h</strong><span>typical verified tutor response time</span></div>
            </div>
          </div>

          <div class="auth-testimonial">
            <p>"Mentora replaced weeks of scattered WhatsApp chats with one clear teacher match and a proper learning plan."</p>
            <div class="auth-person">
              <span class="auth-avatar"></span>
              <div>
                <div class="font-semibold">Asma T.</div>
                <div class="text-sm text-muted-foreground">Parent, Lahore</div>
              </div>
            </div>
          </div>
        </section>

        <section class="auth-form-stage">
          <div class="auth-panel">
            <a routerLink="/" class="auth-brand-mobile" aria-label="Mentora home">
              <span class="auth-brand-mark"><app-icon name="sparkles" className="h-5 w-5" /></span>
              <span class="text-2xl">Mentora</span>
            </a>
            <div class="premium-kicker"><app-icon name="sparkles" className="h-3.5 w-3.5" /> Secure family workspace</div>
            <h1 class="mt-5">Welcome back</h1>
            <p class="mt-3">Sign in to continue with Tutorly Insight, demos, saved tutors, and teacher messages.</p>

            <form class="auth-form" (ngSubmit)="submit()">
              <label class="premium-field">
                <span>Email or phone</span>
                <input name="emailOrPhone" [(ngModel)]="form.emailOrPhone" autocomplete="username" placeholder="you@example.com" />
              </label>

              <label class="premium-field">
                <span>Password</span>
                <input name="password" [(ngModel)]="form.password" type="password" autocomplete="current-password" placeholder="Enter your password" />
              </label>

              <div class="auth-row">
                <label class="flex items-center gap-2"><input type="checkbox" /> Remember me</label>
                <button type="button" class="auth-link" (click)="showPasswordResetHelp()">Forgot password?</button>
              </div>

              @if (errorMessage) {
                <div class="auth-error">{{ errorMessage }}</div>
              }
              @if (infoMessage) {
                <div class="auth-info">{{ infoMessage }}</div>
              }

              <button type="submit" [disabled]="isSubmitting" class="premium-btn premium-btn--primary w-full">
                {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
              </button>
            </form>

            <div class="auth-divider">OR</div>
            <button type="button" class="premium-btn premium-btn--secondary w-full" disabled title="Google sign-in is coming soon">Google sign-in coming soon</button>
            <div class="auth-footer">New to Mentora? <a routerLink="/role" class="auth-link">Create account</a></div>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class LoginComponent {
  form = {
    emailOrPhone: '',
    password: '',
  };
  isSubmitting = false;
  errorMessage = '';
  infoMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  submit(): void {
    this.errorMessage = '';
    this.infoMessage = '';
    this.isSubmitting = true;

    this.authService.login(this.form).subscribe({
      next: result => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const target = returnUrl?.startsWith('/')
          ? returnUrl
          : result.user.role === 'tutor' ? '/tutor-dashboard' : '/dashboard';
        this.router.navigateByUrl(target);
      },
      error: () => {
        this.errorMessage = 'Invalid email/phone or password.';
        this.isSubmitting = false;
      },
    });
  }

  showPasswordResetHelp(): void {
    this.errorMessage = '';
    this.infoMessage = 'Password reset is being set up. For now, contact support to reset your account.';
  }
}
