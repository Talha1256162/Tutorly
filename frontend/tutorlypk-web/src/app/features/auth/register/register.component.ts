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
          <span class="font-display font-bold text-2xl">Mentora</span>
        </a>
        <section class="glass-strong rounded-3xl p-8 sm:p-12 shadow-card">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <div class="text-xs uppercase tracking-wider text-cyan mb-2">{{ roleBadge }}</div>
              <h1 class="font-display text-3xl font-bold">Create {{ roleTitle }} account</h1>
              <p class="mt-2 text-sm text-muted-foreground">{{ roleDescription }}</p>
            </div>
            <a routerLink="/role" class="text-sm text-muted-foreground">Change role</a>
          </div>
          <form class="space-y-6" (ngSubmit)="submit()">
            <label class="block"><span class="text-xs uppercase tracking-wider text-muted-foreground">{{ nameLabel }}</span><input name="fullName" [(ngModel)]="form.fullName" class="mt-2 w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" [placeholder]="namePlaceholder" /></label>
            <label class="block"><span class="text-xs uppercase tracking-wider text-muted-foreground">Phone</span><input name="phone" [(ngModel)]="form.phone" class="mt-2 w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" placeholder="+92 3xx xxxxxxx" /></label>
            <label class="block"><span class="text-xs uppercase tracking-wider text-muted-foreground">Email</span><input name="email" [(ngModel)]="form.email" class="mt-2 w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" placeholder="you@example.com" /></label>
            <label class="block"><span class="text-xs uppercase tracking-wider text-muted-foreground">Password</span><input name="password" [(ngModel)]="form.password" type="password" class="mt-2 w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" /></label>
            <div class="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-muted-foreground">{{ setupNote }}</div>
            @if (errorMessage) {
              <div class="rounded-3xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm text-red-100">{{ errorMessage }}</div>
            }
            <div class="flex items-center justify-between pt-4">
              <a routerLink="/role" class="text-muted-foreground">Back</a>
              <button type="submit" [disabled]="isSubmitting" class="rounded-3xl bg-primary-gradient px-8 py-3.5 font-semibold text-primary-foreground shadow-glow disabled:opacity-70">{{ isSubmitting ? 'Creating...' : 'Create account' }}</button>
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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    const requestedRole = this.route.snapshot.queryParamMap.get('role');
    this.role = requestedRole === 'tutor' ? 'tutor' : 'student';
  }

  get roleTitle(): string {
    return this.role === 'tutor' ? 'teacher' : 'student / parent';
  }

  get roleBadge(): string {
    return this.role === 'tutor' ? 'Teacher portal' : 'Student / Parent workspace';
  }

  get roleDescription(): string {
    if (this.role === 'tutor') {
      return 'Build your verified tutor profile and manage student requests.';
    }
    return 'Find trusted teachers, book demos, and manage the learning journey.';
  }

  get nameLabel(): string {
    return this.role === 'tutor' ? 'Full name' : 'Student or parent name';
  }

  get namePlaceholder(): string {
    return this.role === 'tutor' ? 'As on CNIC' : 'Your full name';
  }

  get setupNote(): string {
    if (this.role === 'tutor') {
      return 'Next, you can complete subjects, availability, fees, and verification before receiving bookings.';
    }
    return 'Your dashboard focuses on teacher matches, upcoming classes, messages, and progress.';
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
