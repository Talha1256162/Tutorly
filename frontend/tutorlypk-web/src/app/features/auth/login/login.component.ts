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
    <main class="min-h-screen grid lg:grid-cols-2 bg-background">
      <section class="relative hidden lg:flex flex-col justify-between p-14 overflow-hidden">
        <div class="absolute inset-0 bg-hero-gradient"></div>
        <div class="absolute inset-0 noise"></div>
        <a routerLink="/" class="relative flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-primary-gradient grid place-items-center"><app-icon name="sparkles" className="h-5 w-5 text-primary-foreground" /></div>
          <span class="font-display font-bold text-2xl">Mentora</span>
        </a>
        <div class="relative max-w-lg">
          <h1 class="font-display text-5xl font-bold leading-tight">"Mentora replaced 8 weeks of WhatsApp pain with one perfect tutor."</h1>
          <div class="flex items-center gap-4 mt-8">
            <div class="h-12 w-12 rounded-full bg-aurora"></div>
            <div><div class="font-semibold">Asma T.</div><div class="text-sm text-muted-foreground">Parent · Lahore</div></div>
          </div>
        </div>
        <div class="relative text-sm text-muted-foreground">© 2026 Mentora · Pakistan</div>
      </section>

      <section class="grid place-items-center px-6">
        <div class="w-full max-w-md">
          <a routerLink="/" class="lg:hidden flex items-center gap-3 mb-12">
            <div class="h-10 w-10 rounded-full bg-primary-gradient grid place-items-center"><app-icon name="sparkles" className="h-5 w-5 text-primary-foreground" /></div>
            <span class="font-display font-bold text-2xl">Mentora</span>
          </a>
          <h1 class="font-display text-4xl font-bold">Welcome back</h1>
          <p class="text-muted-foreground mt-2">Sign in to continue your learning journey.</p>
          <form class="mt-10 space-y-6" (ngSubmit)="submit()">
            <label class="block">
              <span class="text-xs uppercase tracking-wider text-muted-foreground">Email or phone</span>
              <input name="emailOrPhone" [(ngModel)]="form.emailOrPhone" class="mt-2 w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" placeholder="you@example.com" />
            </label>
            <label class="block">
              <span class="text-xs uppercase tracking-wider text-muted-foreground">Password</span>
              <input name="password" [(ngModel)]="form.password" type="password" class="mt-2 w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" />
            </label>
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 text-muted-foreground"><input type="checkbox" /> Remember me</label>
              <a class="text-primary">Forgot password?</a>
            </div>
            @if (errorMessage) {
              <div class="rounded-3xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm text-red-100">{{ errorMessage }}</div>
            }
            <button type="submit" [disabled]="isSubmitting" class="w-full rounded-3xl bg-primary-gradient px-5 py-4 font-semibold text-primary-foreground shadow-glow disabled:opacity-70">{{ isSubmitting ? 'Signing in...' : 'Sign in' }}</button>
          </form>
          <div class="my-6 flex items-center gap-4 text-xs text-muted-foreground"><div class="h-px flex-1 bg-white/10"></div>OR<div class="h-px flex-1 bg-white/10"></div></div>
          <button class="w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-4 font-semibold">Continue with Google</button>
          <div class="text-center text-muted-foreground mt-8">New to Mentora? <a routerLink="/role" class="text-primary font-semibold">Create account</a></div>
        </div>
      </section>
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

  constructor(
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  submit(): void {
    this.errorMessage = '';
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
}
