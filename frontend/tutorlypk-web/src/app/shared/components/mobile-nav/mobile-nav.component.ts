import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="ref-mobile-nav lg:hidden fixed inset-x-3 z-50 glass-strong rounded-2xl flex justify-around shadow-card">
      <a routerLink="/" routerLinkActive="text-foreground" [routerLinkActiveOptions]="{ exact: true }" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
        <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="house" className="h-3.5 w-3.5" /></div>Home
      </a>
      <a routerLink="/tutors" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
        <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="search" className="h-3.5 w-3.5" /></div>Tutors
      </a>
      <a routerLink="/dashboard" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
        <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="sparkles" className="h-3.5 w-3.5" /></div>Matches
      </a>
      <a routerLink="/messages" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
        <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="message-circle" className="h-3.5 w-3.5" /></div>Messages
      </a>
      <a routerLink="/login" routerLinkActive="text-foreground" class="ref-mobile-link flex flex-col items-center rounded-xl transition text-muted-foreground">
        <div class="ref-mobile-icon grid place-items-center rounded-lg transition"><app-icon name="user" className="h-3.5 w-3.5" /></div>Profile
      </a>
    </nav>
  `,
})
export class MobileNavComponent {}
