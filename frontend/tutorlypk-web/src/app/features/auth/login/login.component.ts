import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthResult } from '../../../core/models/api.models';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsApi = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        ux_mode?: 'popup' | 'redirect';
      }) => void;
      renderButton: (parent: HTMLElement, options: {
        type?: 'standard' | 'icon';
        theme?: 'outline' | 'filled_blue' | 'filled_black';
        size?: 'large' | 'medium' | 'small';
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
        shape?: 'rectangular' | 'pill' | 'circle' | 'square';
        logo_alignment?: 'left' | 'center';
        width?: number;
      }) => void;
      cancel: () => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleAccountsApi;
  }
}

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
            @if (googleAuthLoading) {
              <button type="button" class="premium-btn premium-btn--secondary w-full" disabled>Loading Google sign-in...</button>
            } @else if (googleClientId) {
              <div class="google-signin-shell" [class.google-signin-shell--busy]="isGoogleSubmitting">
                <div #googleButton class="google-signin-button" aria-label="Continue with Google"></div>
                @if (isGoogleSubmitting) {
                  <div class="google-signin-overlay">Signing in...</div>
                }
              </div>
            } @else {
              <button type="button" class="google-fallback-btn" (click)="showGoogleSetupHelp()" title="Google Client ID is required">
                <span class="google-fallback-mark">G</span>
                Continue with Google
              </button>
            }
            <div class="auth-footer">New to Mentora? <a routerLink="/role" class="auth-link">Create account</a></div>
          </div>
        </section>
      </div>
    </main>
  `,
})
export class LoginComponent implements OnInit, OnDestroy {
  private static googleScriptPromise?: Promise<void>;

  private googleButton?: ElementRef<HTMLDivElement>;
  private googleButtonRendered = false;

  @ViewChild('googleButton')
  set googleButtonRef(value: ElementRef<HTMLDivElement> | undefined) {
    this.googleButton = value;
    this.renderGoogleButton();
  }

  form = {
    emailOrPhone: '',
    password: '',
  };
  isSubmitting = false;
  isGoogleSubmitting = false;
  googleAuthLoading = true;
  googleClientId = '';
  errorMessage = '';
  infoMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadGoogleConfig();
  }

  ngOnDestroy(): void {
    window.google?.accounts.id.cancel();
  }

  submit(): void {
    this.errorMessage = '';
    this.infoMessage = '';
    this.isSubmitting = true;

    this.authService.login(this.form).subscribe({
      next: result => this.redirectAfterLogin(result),
      error: () => {
        this.errorMessage = 'Invalid email/phone or password.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  showPasswordResetHelp(): void {
    this.errorMessage = '';
    this.infoMessage = 'Password reset is being set up. For now, contact support to reset your account.';
  }

  showGoogleSetupHelp(): void {
    this.errorMessage = '';
    this.infoMessage = 'Google sign-in is ready in the app, but Google Client ID is not configured on the server yet.';
  }

  private loadGoogleConfig(): void {
    this.googleAuthLoading = true;
    this.authService.googleConfig().subscribe({
      next: config => {
        this.googleAuthLoading = false;
        this.googleClientId = config.enabled && config.clientId ? config.clientId : '';
        this.cdr.detectChanges();
        this.renderGoogleButton();
      },
      error: () => {
        this.googleAuthLoading = false;
        this.googleClientId = '';
        this.cdr.detectChanges();
      },
    });
  }

  private renderGoogleButton(): void {
    if (!this.googleClientId || !this.googleButton || this.googleButtonRendered) {
      return;
    }

    this.googleButtonRendered = true;
    this.loadGoogleScript()
      .then(() => {
        const buttonElement = this.googleButton?.nativeElement;
        if (!buttonElement || !window.google) {
          return;
        }

        buttonElement.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: this.googleClientId,
          callback: response => this.ngZone.run(() => this.handleGoogleCredential(response)),
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
        });

        const buttonWidth = Math.min(Math.max(buttonElement.clientWidth || 320, 240), 400);
        window.google.accounts.id.renderButton(buttonElement, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'center',
          width: buttonWidth,
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.googleButtonRendered = false;
          this.googleClientId = '';
          this.infoMessage = 'Google sign-in could not be loaded. Please try email login or refresh the page.';
          this.cdr.detectChanges();
        });
      });
  }

  private handleGoogleCredential(response: GoogleCredentialResponse): void {
    this.errorMessage = '';
    this.infoMessage = '';

    if (!response.credential) {
      this.errorMessage = 'Google sign-in did not return a valid credential.';
      return;
    }

    this.isGoogleSubmitting = true;
    this.cdr.detectChanges();
    this.authService.loginWithGoogle({ credential: response.credential, role: 'student' }).subscribe({
      next: result => this.redirectAfterLogin(result),
      error: () => {
        this.errorMessage = 'Google sign-in failed. Please try again or use email login.';
        this.isGoogleSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadGoogleScript(): Promise<void> {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    if (LoginComponent.googleScriptPromise) {
      return LoginComponent.googleScriptPromise;
    }

    LoginComponent.googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById('google-identity-services');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-identity-services';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });

    return LoginComponent.googleScriptPromise;
  }

  private redirectAfterLogin(result: AuthResult): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const target = returnUrl?.startsWith('/')
      ? returnUrl
      : result.user.role === 'tutor' ? '/tutor-dashboard' : '/dashboard';
    this.router.navigateByUrl(target);
  }
}
