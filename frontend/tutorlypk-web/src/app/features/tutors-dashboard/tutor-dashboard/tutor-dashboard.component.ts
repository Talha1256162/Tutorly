import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { TutorDashboard } from '../../../core/models/api.models';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';

@Component({
  selector: 'app-tutor-dashboard',
  standalone: true,
  imports: [StatsCardComponent],
  template: `
    @if (dashboard) {
      <section class="mx-auto max-w-7xl px-6 py-8">
        <div class="glass-strong rounded-3xl p-8 shadow-card bg-hero-gradient">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div><div class="text-cyan text-xs font-bold uppercase tracking-wider mb-2">★ Tutor portal</div><h1 class="font-display text-4xl font-bold">{{ dashboard.headline }} 🌙</h1><p class="text-muted-foreground mt-2">{{ dashboard.subheadline }}</p></div>
            <div class="md:w-64"><div class="flex justify-between text-sm mb-2"><span class="text-muted-foreground">Profile strength</span><b>{{ dashboard.profileStrength }}%</b></div><div class="h-2 rounded-full bg-white/5 overflow-hidden"><div class="h-full bg-aurora" [style.width.%]="dashboard.profileStrength"></div></div></div>
          </div>
        </div>
        <div class="grid md:grid-cols-4 gap-5 mt-8">@for (stat of dashboard.stats; track stat.label) {<app-stats-card [stat]="stat" />}</div>
        <div class="grid lg:grid-cols-[1.4fr_1fr] gap-6 mt-8">
          <div class="space-y-6">
            <section class="glass-strong rounded-3xl p-7 shadow-card min-h-[300px]">
              <h2 class="font-display text-xl font-semibold">Earnings — last 6 months</h2>
              <div class="h-48 flex items-end gap-8 mt-8 border-b border-white/10">
                @for (value of dashboard.earnings.values; track $index) {
                  <div class="flex-1 rounded-t-2xl bg-primary/20" [style.height.%]="value / 2"></div>
                }
              </div>
              <div class="flex justify-between text-xs text-muted-foreground mt-3">@for (label of dashboard.earnings.labels; track label) {<span>{{ label }}</span>}</div>
              <div class="mt-8 pt-6 border-t border-white/5 flex justify-between items-end"><div><div class="text-muted-foreground">YTD earnings</div><div class="font-display text-3xl font-bold">{{ dashboard.earnings.totalText }}</div></div><button class="rounded-2xl border border-white/10 px-5 py-2 font-semibold">Withdraw ↗</button></div>
            </section>
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold mb-6">New student requests</h2>
              @for (request of dashboard.studentRequests; track request.studentName) {
                <div class="glass rounded-3xl p-4 flex items-center gap-4 mb-4"><div class="h-12 w-12 rounded-full bg-primary-gradient grid place-items-center text-primary-foreground font-semibold">{{ request.initial }}</div><div class="flex-1"><div class="font-semibold">{{ request.studentName }}</div><div class="text-sm text-muted-foreground">{{ request.detail }} · {{ request.receivedAt }}</div></div><button class="rounded-2xl border border-white/10 px-4 py-2 font-semibold">Decline</button><button class="rounded-2xl bg-primary-gradient px-4 py-2 font-semibold text-primary-foreground">Accept</button></div>
              }
            </section>
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold mb-6">Subject performance</h2>
              @for (subject of dashboard.subjectPerformance; track subject.subject) {
                <div class="flex justify-between mb-5"><b>{{ subject.subject }}</b><span class="text-muted-foreground">Rating <b class="text-foreground">{{ subject.rating }}</b> &nbsp; Retention <b class="text-foreground">{{ subject.retentionPercentage }}%</b></span></div>
              }
            </section>
          </div>
          <div class="space-y-6">
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold mb-5">Availability — this week</h2>
              <div class="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground mb-2">@for (day of dashboard.availability; track $index) {<div>{{ day.day }}</div>}</div>
              <div class="grid grid-cols-7 gap-2">
                @for (day of dashboard.availability; track $index) {
                  <div class="space-y-2">@for (slot of day.slots; track $index) {<div class="h-5 rounded-full" [class.bg-primary]="slot" [class.bg-white/5]="!slot"></div>}</div>
                }
              </div>
              <button class="w-full mt-6 rounded-2xl border border-white/10 px-5 py-3 font-semibold">Edit availability</button>
            </section>
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold mb-5">Recent reviews</h2>
              @for (review of dashboard.recentReviews; track review.reviewerName) {
                <div class="glass rounded-3xl p-5 mb-4"><div class="flex justify-between"><b>{{ review.reviewerName }}</b><span class="text-warning">★★★★★</span></div><p class="text-muted-foreground mt-2">"{{ review.quote }}"</p></div>
              }
            </section>
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold mb-6">Response rate</h2>
              <div class="flex items-center gap-8"><div class="h-28 w-28 rounded-full bg-aurora p-2"><div class="h-full w-full rounded-full bg-background grid place-items-center font-display text-3xl font-bold">{{ dashboard.responseRate.percentage }}%</div></div><div class="text-sm text-muted-foreground space-y-2"><div>{{ dashboard.responseRate.averageReply }}</div><div class="text-success">{{ dashboard.responseRate.rank }}</div><div>{{ dashboard.responseRate.delta }}</div></div></div>
            </section>
          </div>
        </div>
      </section>
    }
  `,
})
export class TutorDashboardComponent implements OnInit {
  dashboard?: TutorDashboard;
  constructor(private readonly api: ApiService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.api.tutorDashboard().subscribe(dashboard => {
      this.dashboard = dashboard;
      this.cdr.detectChanges();
    });
  }
}
