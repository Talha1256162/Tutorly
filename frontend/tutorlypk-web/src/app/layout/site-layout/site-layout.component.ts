import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { MobileNavComponent } from '../../shared/components/mobile-nav/mobile-nav.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-site-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, MobileNavComponent],
  template: `
    <div class="min-h-screen relative">
      <app-navbar />
      <main class="app-main">
        <router-outlet />
      </main>
      <app-footer />
      <app-mobile-nav />
    </div>
  `,
})
export class SiteLayoutComponent {}
