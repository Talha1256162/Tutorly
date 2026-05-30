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
    <main class="premium-auth">
      <div class="auth-grid">
        <section class="auth-showcase">
          <a routerLink="/" class="auth-brand" aria-label="Mentora home">
            <span class="auth-brand-mark"><app-icon name="sparkles" className="h-5 w-5" /></span>
            <span class="text-2xl">Mentora</span>
          </a>

          <div class="auth-copy">
            <div class="premium-kicker"><app-icon name="graduation-cap" className="h-3.5 w-3.5" /> {{ roleBadge }}</div>
            <h1>{{ role === 'tutor' ? 'Build a teacher profile families can trust.' : 'Create a family workspace for better tutor decisions.' }}</h1>
            <p>{{ roleDescription }}</p>

            <div class="auth-metrics">
              <div class="auth-metric"><strong>1</strong><span>clear profile and verified identity</span></div>
              <div class="auth-metric"><strong>3</strong><span>learning signals before booking</span></div>
              <div class="auth-metric"><strong>0</strong><span>pressure before a demo class</span></div>
            </div>
          </div>

          <div class="auth-testimonial">
            <p>{{ setupNote }}</p>
            <div class="auth-person">
              <span class="auth-avatar"></span>
              <div>
                <div class="font-semibold">{{ roleHeading }} setup</div>
                <div class="text-sm text-muted-foreground">Mentora Pakistan</div>
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

            <div class="flex items-center justify-between gap-4">
              <div class="premium-kicker">{{ roleBadge }}</div>
              <a routerLink="/role" class="auth-link text-sm">Change role</a>
            </div>
            <h1 class="mt-5">Create {{ roleTitle }} account</h1>
            <p class="mt-3">{{ roleDescription }}</p>

            <form class="auth-form" (ngSubmit)="submit()">
              <label class="premium-field">
                <span>{{ nameLabel }}</span>
                <input name="fullName" [(ngModel)]="form.fullName" autocomplete="name" [placeholder]="namePlaceholder" />
              </label>

              <div class="grid md:grid-cols-2 gap-3">
                <label class="premium-field">
                  <span>Phone</span>
                  <input name="phone" [(ngModel)]="form.phone" autocomplete="tel" placeholder="+92 3xx xxxxxxx" />
                </label>

                <label class="premium-field">
                  <span>Email</span>
                  <input name="email" [(ngModel)]="form.email" autocomplete="email" placeholder="you@example.com" />
                </label>
              </div>

              <label class="premium-field">
                <span>Password</span>
                <input name="password" [(ngModel)]="form.password" type="password" autocomplete="new-password" placeholder="Create a secure password" />
              </label>

              <div class="premium-note">{{ setupNote }}</div>

              @if (errorMessage) {
                <div class="auth-error">{{ errorMessage }}</div>
              }

              <div class="flex items-center justify-between gap-3 pt-2">
                <a routerLink="/role" class="premium-btn premium-btn--secondary">Back</a>
                <button type="submit" [disabled]="isSubmitting" class="premium-btn premium-btn--primary">
                  {{ isSubmitting ? 'Creating...' : 'Create account' }}
                </button>
              </div>
            </form>

            <div class="auth-footer">Already have an account? <a routerLink="/login" class="auth-link">Sign in</a></div>
          </div>
        </section>
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

  get roleHeading(): string {
    return this.role === 'tutor' ? 'Teacher' : 'Student / Parent';
  }

  get roleBadge(): string {
    return this.role === 'tutor' ? 'Teacher portal' : 'Student / Parent workspace';
  }

  get roleDescription(): string {
    if (this.role === 'tutor') {
      return 'Build your verified tutor profile and manage student requests from one polished portal.';
    }
    return 'Find trusted teachers, book demos, run Tutorly Insight, and manage the learning journey.';
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
    return 'Your dashboard focuses on teacher matches, upcoming classes, Tutorly Insight, messages, and progress.';
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
