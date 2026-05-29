import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { StudentDashboard } from '../../../core/models/api.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { TutorCardComponent } from '../../../shared/components/tutor-card/tutor-card.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [RouterLink, IconComponent, StatsCardComponent, TutorCardComponent],
  template: `
    @if (dashboard) {
      <section class="mx-auto max-w-7xl px-6 py-8">
        <div class="glass-strong rounded-3xl p-8 shadow-card bg-hero-gradient">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div class="text-cyan text-xs font-bold uppercase tracking-wider mb-2"><app-icon name="sparkles" className="h-3 w-3 inline-block mr-1" /> {{ workspaceLabel }}</div>
              <h1 class="font-display text-4xl font-bold">{{ dashboard.headline }}</h1>
              <p class="text-muted-foreground mt-2">{{ dashboard.subheadline }}</p>
            </div>
            <a routerLink="/tutors" class="inline-flex items-center gap-2 rounded-xl bg-primary-gradient px-6 py-3.5 font-semibold text-primary-foreground shadow-glow">{{ findTutorLabel }}</a>
          </div>
        </div>
        <div class="grid md:grid-cols-4 gap-5 mt-8">
          @for (stat of dashboard.stats; track stat.label) { <app-stats-card [stat]="stat" /> }
        </div>
        <div class="grid lg:grid-cols-[1.4fr_1fr] gap-6 mt-8">
          <div class="space-y-6">
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <div class="flex justify-between mb-5"><h2 class="font-display text-xl font-semibold">{{ recommendationLabel }}</h2><a routerLink="/tutors" class="text-sm text-muted-foreground">See all</a></div>
              <div class="grid md:grid-cols-2 gap-5">@for (tutor of dashboard.recommendedTutors; track tutor.id) {<app-tutor-card [tutor]="tutor" />}</div>
            </section>
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold mb-6">{{ progressLabel }}</h2>
              @for (item of dashboard.progress; track item.label) {
                <div class="mb-5"><div class="flex justify-between mb-2"><span class="font-semibold">{{ item.label }}</span><span class="text-muted-foreground">{{ item.percentage }}%</span></div><div class="h-2 rounded-full bg-white/5 overflow-hidden"><div class="h-full bg-aurora" [style.width.%]="item.percentage"></div></div></div>
              }
            </section>
          </div>
          <div class="space-y-6">
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold mb-5">{{ demoLabel }}</h2>
              @for (demo of dashboard.upcomingDemos; track demo.tutorName) {
                <div class="glass rounded-3xl p-4 flex items-center gap-4 mb-4"><img [src]="demo.tutorPhotoUrl" class="h-12 w-12 rounded-2xl object-cover" /><div class="flex-1"><div class="font-semibold">{{ demo.tutorName }}</div><div class="text-sm text-muted-foreground">{{ demo.subject }} - {{ demo.startsAt }}</div></div><button class="rounded-2xl bg-primary-gradient px-5 py-2 font-semibold text-primary-foreground">{{ demo.actionLabel }}</button></div>
              }
            </section>
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <div class="flex justify-between mb-5"><h2 class="font-display text-xl font-semibold">{{ messageLabel }}</h2><a routerLink="/messages" class="text-sm text-muted-foreground">Open inbox</a></div>
              @for (message of dashboard.messages; track message.personName) {
                <div class="flex items-center gap-4 mb-4"><img [src]="message.photoUrl" class="h-10 w-10 rounded-full object-cover" /><div class="flex-1"><div class="font-semibold">{{ message.personName }}</div><div class="text-sm text-muted-foreground">{{ message.preview }}</div></div><app-icon name="clock" className="h-4 w-4 text-muted-foreground" /></div>
              }
            </section>
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold mb-5">Recent activity</h2>
              @for (activity of dashboard.recentActivity; track activity.text) {
                <div class="flex gap-3 mb-4"><span class="h-2 w-2 rounded-full bg-primary mt-2"></span><div><div class="font-semibold">{{ activity.text }}</div><div class="text-sm text-muted-foreground">{{ activity.timeAgo }}</div></div></div>
              }
            </section>
          </div>
        </div>
      </section>
    }
  `,
})
export class StudentDashboardComponent implements OnInit {
  dashboard?: StudentDashboard;

  constructor(
    private readonly api: ApiService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  get workspaceLabel(): string {
    return 'Student / Parent workspace';
  }

  get findTutorLabel(): string {
    return 'Find more teachers';
  }

  get recommendationLabel(): string {
    return 'Recommended teachers';
  }

  get progressLabel(): string {
    return 'Learning progress';
  }

  get demoLabel(): string {
    return 'Upcoming demo classes';
  }

  get messageLabel(): string {
    return 'Teacher conversations';
  }

  ngOnInit(): void {
    this.api.studentDashboard().subscribe(dashboard => {
      const firstName = this.authService.currentUser?.fullName.split(' ')[0] ?? dashboard.welcomeName;
      this.dashboard = {
        ...dashboard,
        welcomeName: firstName,
        headline: `As-salamu alaykum, ${firstName}`,
      };
      this.cdr.detectChanges();
    });
  }
}
