import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent],
  template: `
    <main class="min-h-screen relative overflow-hidden grid place-items-start justify-center px-6 py-12">
      <div class="absolute inset-0 bg-hero-gradient opacity-70"></div>
      <div class="relative w-full max-w-2xl">
        <a routerLink="/" class="flex items-center gap-3 mb-10">
          <div class="h-10 w-10 rounded-full bg-primary-gradient grid place-items-center"><app-icon name="sparkles" className="h-5 w-5 text-primary-foreground" /></div>
          <span class="font-display font-bold text-2xl">Lumora</span>
        </a>
        <section class="glass-strong rounded-3xl p-8 sm:p-12 shadow-card">
          <div class="flex items-center justify-between mb-8">
            <h1 class="font-display text-3xl font-bold">Create {{ role }} account</h1>
            <a routerLink="/role" class="text-sm text-muted-foreground">Change role</a>
          </div>
          <div class="flex items-center gap-4 mb-10">
            @for (step of steps; track step.no) {
              <div class="flex items-center gap-3 flex-1">
                <div class="h-8 w-8 rounded-full grid place-items-center font-semibold" [class.bg-primary-gradient]="step.no === 1" [class.bg-white/5]="step.no !== 1">{{ step.no }}</div>
                <div class="text-sm" [class.text-muted-foreground]="step.no !== 1">{{ step.label }}</div>
                @if (step.no < 3) { <div class="h-px flex-1 bg-white/10"></div> }
              </div>
            }
          </div>
          <form class="space-y-6" (ngSubmit)="submit()">
            <label class="block"><span class="text-xs uppercase tracking-wider text-muted-foreground">Full name</span><input name="fullName" [(ngModel)]="form.fullName" class="mt-2 w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" placeholder="As on CNIC" /></label>
            <label class="block"><span class="text-xs uppercase tracking-wider text-muted-foreground">Phone</span><input name="phone" [(ngModel)]="form.phone" class="mt-2 w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" placeholder="+92 3xx xxxxxxx" /></label>
            <label class="block"><span class="text-xs uppercase tracking-wider text-muted-foreground">Email</span><input name="email" [(ngModel)]="form.email" class="mt-2 w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" placeholder="you@example.com" /></label>
            <label class="block"><span class="text-xs uppercase tracking-wider text-muted-foreground">Password</span><input name="password" [(ngModel)]="form.password" type="password" class="mt-2 w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" /></label>
            @if (errorMessage) {
              <div class="rounded-3xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm text-red-100">{{ errorMessage }}</div>
            }
            <div class="flex items-center justify-between pt-4">
              <a routerLink="/role" class="text-muted-foreground">← Back</a>
              <button type="submit" [disabled]="isSubmitting" class="rounded-3xl bg-primary-gradient px-8 py-3.5 font-semibold text-primary-foreground shadow-glow disabled:opacity-70">{{ isSubmitting ? 'Creating...' : 'Continue' }}</button>
            </div>
          </form>
        </section>
        <div class="text-center text-muted-foreground mt-8">Already have an account? <a routerLink="/login" class="text-primary font-semibold">Sign in</a></div>
      </div>
    </main>
  `,
})
export class RegisterComponent implements OnInit {
  role = 'student';
  form = {
    fullName: '',
    phone: '',
    email: '',
    password: '',
  };
  isSubmitting = false;
  errorMessage = '';
  steps = [
    { no: 1, label: 'Account' },
    { no: 2, label: 'Your child' },
    { no: 3, label: 'Preferences' },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.role = this.route.snapshot.queryParamMap.get('role') === 'tutor' ? 'tutor' : 'student';
    this.steps = this.role === 'tutor'
      ? [{ no: 1, label: 'Account' }, { no: 2, label: 'Subjects' }, { no: 3, label: 'Verification' }]
      : this.steps;
  }

  submit(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService.register({
      role: this.role,
      fullName: this.form.fullName,
      phone: this.form.phone,
      email: this.form.email,
      password: this.form.password,
      city: 'Lahore',
      subjects: [],
      classLevels: [],
      preferredModes: [],
    }).subscribe({
      next: result => {
        const target = result.user.role === 'tutor' ? '/tutor-dashboard' : '/dashboard';
        this.router.navigateByUrl(target);
      },
      error: () => {
        this.errorMessage = 'Could not create account. Please check the details and try again.';
        this.isSubmitting = false;
      },
    });
  }
}
