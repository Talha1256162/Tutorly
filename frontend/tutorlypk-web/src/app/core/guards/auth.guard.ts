import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> {
    if (this.authService.isSignedIn()) {
      return this.authorizeRole(_route);
    }

    if (this.authService.refreshToken) {
      return this.authService.refresh().pipe(
        map(() => this.authorizeRole(_route)),
        catchError(() => {
          this.authService.clearSession();
          return of(this.loginRedirect(state.url));
        }),
      );
    }

    return this.loginRedirect(state.url);
  }

  private loginRedirect(returnUrl: string): UrlTree {
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }

  private authorizeRole(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRoles = route.data['roles'] as string[] | undefined;
    const role = this.authService.currentUser?.role;
    if (!allowedRoles || (role && allowedRoles.includes(role))) {
      return true;
    }

    return this.router.parseUrl(role === 'tutor' ? '/tutor-dashboard' : '/dashboard');
  }
}
