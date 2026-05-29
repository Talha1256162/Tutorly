import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { TutorProfile } from '../../../core/models/api.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-tutor-detail',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    @if (profile) {
      <section class="mx-auto max-w-7xl px-6 py-10">
        <a routerLink="/tutors" class="text-sm text-muted-foreground">← Back to tutors</a>
        <div class="grid lg:grid-cols-[1fr_360px] gap-8 mt-6">
          <div class="space-y-6">
            <div class="glass-strong rounded-3xl p-8 shadow-card relative overflow-hidden">
              <div class="absolute inset-0 bg-hero-gradient opacity-50"></div>
              <div class="relative flex flex-col md:flex-row gap-6">
                <div class="relative shrink-0">
                  <div class="h-32 w-32 rounded-3xl bg-aurora p-[2px]">
                    <img [src]="profile.summary.photoUrl" [alt]="profile.summary.name" class="h-full w-full rounded-3xl object-cover" />
                  </div>
                  <div class="absolute -bottom-1 -right-1 bg-success rounded-full p-1 ring-2 ring-background"><app-icon name="shield-check" className="h-5 w-5 text-background" /></div>
                </div>
                <div class="min-w-0">
                  <div class="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-cyan mb-3"><app-icon name="sparkles" className="h-3 w-3" /> {{ profile.summary.matchPercentage || 92 }}% AI MATCH</div>
                  <h1 class="font-display text-5xl font-bold tracking-tight">{{ profile.summary.name }}</h1>
                  <p class="text-muted-foreground mt-2 max-w-2xl">{{ profile.summary.tagline }}</p>
                  <div class="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    <span class="flex items-center gap-1"><app-icon name="star" className="h-4 w-4 fill-warning text-warning" /> <b class="text-foreground">{{ profile.summary.rating }}</b> ({{ profile.summary.reviews }} reviews)</span>
                    <span class="flex items-center gap-1"><app-icon name="map-pin" className="h-4 w-4" /> {{ profile.summary.city }}</span>
                    <span class="flex items-center gap-1"><app-icon name="clock" className="h-4 w-4" /> {{ profile.summary.responseTime }}</span>
                  </div>
                  <div class="flex flex-wrap gap-2 mt-5">
                    @for (subject of profile.summary.subjects; track subject) {
                      <span class="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-muted-foreground">{{ subject }}</span>
                    }
                    <span class="text-xs px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">{{ profile.summary.teachingMode }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid md:grid-cols-3 gap-4">
              <div class="glass-strong rounded-2xl p-5"><div class="text-muted-foreground text-sm">Experience</div><div class="font-display text-2xl font-bold">{{ profile.summary.experienceYears }} years</div></div>
              <div class="glass-strong rounded-2xl p-5"><div class="text-muted-foreground text-sm">Students taught</div><div class="font-display text-2xl font-bold">{{ profile.summary.studentsTaught }}+</div></div>
              <div class="glass-strong rounded-2xl p-5"><div class="text-muted-foreground text-sm">Fee</div><div class="font-display text-2xl font-bold">{{ profile.summary.feeText }}</div></div>
            </div>

            <article class="glass-strong rounded-3xl p-8 shadow-card">
              <h2 class="font-display text-2xl font-semibold mb-3">About</h2>
              <p class="text-muted-foreground leading-relaxed">{{ profile.about }}</p>
            </article>

            <article class="glass-strong rounded-3xl p-8 shadow-card">
              <h2 class="font-display text-2xl font-semibold mb-3">Teaching style</h2>
              <p class="text-muted-foreground leading-relaxed">{{ profile.teachingStyle }}</p>
            </article>

            <div class="grid md:grid-cols-2 gap-5">
              <article class="glass-strong rounded-3xl p-8 shadow-card"><h2 class="font-display text-2xl font-semibold mb-4">Education</h2>@for (item of profile.education; track item) {<div class="flex items-center gap-2 mb-3 text-muted-foreground"><app-icon name="graduation-cap" className="h-4 w-4 text-cyan" /> {{ item }}</div>}</article>
              <article class="glass-strong rounded-3xl p-8 shadow-card"><h2 class="font-display text-2xl font-semibold mb-4">Experience</h2>@for (item of profile.achievements; track item) {<div class="flex items-center gap-2 mb-3 text-muted-foreground"><app-icon name="check" className="h-4 w-4 text-success" /> {{ item }}</div>}</article>
            </div>

            <article class="glass-strong rounded-3xl p-8 shadow-card">
              <h2 class="font-display text-2xl font-semibold mb-5">Reviews</h2>
              <div class="grid md:grid-cols-2 gap-4">
                @for (review of profile.reviews; track review.reviewerName) {
                  <div class="glass rounded-2xl p-5"><div class="text-warning mb-2">★★★★★</div><p>"{{ review.quote }}"</p><div class="text-sm text-muted-foreground mt-4">{{ review.reviewerName }} · {{ review.context }}</div></div>
                }
              </div>
            </article>
          </div>

          <aside class="lg:sticky lg:top-28 h-fit space-y-5">
            <div class="glass-strong rounded-3xl p-7 shadow-card">
              <div class="font-display text-2xl font-bold">{{ profile.summary.feeText }}</div>
              <div class="text-sm text-muted-foreground mt-1">{{ profile.summary.nextSlot }}</div>
              <div class="mt-6 space-y-3">
                @for (slot of profile.availability; track slot) {
                  <div class="glass rounded-xl px-4 py-3 flex items-center justify-between"><span>{{ slot }}</span><span class="text-success text-sm">Available</span></div>
                }
              </div>
              <a [routerLink]="['/book', profile.summary.id]" class="mt-6 w-full inline-flex justify-center rounded-xl bg-primary-gradient px-5 py-3 font-semibold text-primary-foreground shadow-glow">Book Demo</a>
              <a routerLink="/messages" [queryParams]="{ tutor: profile.summary.id }" class="mt-3 w-full inline-flex justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10">Message Tutor</a>
            </div>
            <div class="glass-strong rounded-3xl p-6 shadow-card space-y-3 text-sm">
              <div class="flex items-center gap-2"><app-icon name="shield-check" className="h-4 w-4 text-success" /> Verified tutor with CNIC check</div>
              <div class="flex items-center gap-2"><app-icon name="message-circle" className="h-4 w-4 text-success" /> Secure Mentora messaging</div>
              <div class="flex items-center gap-2"><app-icon name="wallet" className="h-4 w-4 text-success" /> No payment until you commit</div>
            </div>
          </aside>
        </div>
      </section>
    }
  `,
})
export class TutorDetailComponent implements OnInit {
  profile?: TutorProfile;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? 'ayesha-malik';
    this.api.tutorProfile(id).subscribe(profile => {
      this.profile = profile;
      this.cdr.detectChanges();
    });
  }
}
