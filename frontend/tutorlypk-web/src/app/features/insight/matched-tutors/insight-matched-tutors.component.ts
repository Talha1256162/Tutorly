import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { InsightMatchedTutorCard } from '../../../core/models/api.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-insight-matched-tutors',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-8">
      <div class="glass-strong rounded-3xl p-8 shadow-card bg-hero-gradient premium-dashboard-hero">
        <div class="premium-hero-row">
          <div>
            <div class="text-cyan text-xs font-bold uppercase tracking-wider mb-2">Tutorly Insight</div>
            <h1 class="font-display text-4xl font-bold">Matched Tutors</h1>
            <p class="text-muted-foreground mt-2 max-w-2xl">Verified tutors ranked by learning gaps, class level, city, and quality score.</p>
          </div>
          <a routerLink="/dashboard" class="premium-btn premium-btn--secondary">
            Back to dashboard
          </a>
        </div>
      </div>

      @if (loading) {
        <div class="glass-strong rounded-3xl p-8 shadow-card mt-8 text-muted-foreground">Loading matched tutors...</div>
      } @else if (error) {
        <div class="rounded-3xl border border-warning/30 bg-warning/10 px-5 py-4 mt-8 text-warning">{{ error }}</div>
      } @else {
        <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
          @for (tutor of tutors; track tutor.tutorId) {
            <article class="glass-strong rounded-3xl p-6 shadow-card h-full">
              <div class="flex items-start gap-4">
                <div class="relative shrink-0">
                  <img [src]="tutor.photoUrl" [alt]="tutor.name" class="h-16 w-16 rounded-2xl object-cover bg-surface" />
                  @if (tutor.verified) {
                    <span class="absolute -bottom-1 -right-1 bg-success rounded-full p-0.5 ring-2 ring-background">
                      <app-icon name="shield-check" className="h-3.5 w-3.5 text-background" />
                    </span>
                  }
                </div>
                <div class="min-w-0 flex-1">
                  <h2 class="font-display text-xl font-semibold truncate">{{ tutor.name }}</h2>
                  <p class="text-sm text-muted-foreground">{{ tutor.city }}{{ tutor.area ? ' - ' + tutor.area : '' }}</p>
                  <div class="mt-2 inline-flex rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs text-primary font-semibold">
                    {{ tutor.matchScore }} match score
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-2 mt-5">
                @for (subject of tutor.subjects; track subject) {
                  <span class="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-muted-foreground">{{ subject }}</span>
                }
              </div>

              <p class="mt-5 text-sm text-cyan font-medium">{{ tutor.matchReason }}</p>

              <div class="grid grid-cols-2 gap-3 mt-5 text-sm">
                <div class="glass rounded-2xl p-3">
                  <div class="text-xs text-muted-foreground">Quality</div>
                  <div class="font-display text-xl font-bold">{{ tutor.tutorQualityScore }}</div>
                </div>
                <div class="glass rounded-2xl p-3">
                  <div class="text-xs text-muted-foreground">Best for</div>
                  <div class="font-semibold">{{ tutor.bestForClassRange }}</div>
                </div>
              </div>

              <div class="mt-6 pt-5 border-t border-white/5 flex items-center gap-3">
                <div class="font-display font-bold">{{ tutor.estimatedFee ?? 'Fee on request' }}</div>
                <a [routerLink]="['/tutors', tutor.tutorId]" class="ml-auto premium-btn premium-btn--secondary premium-btn--compact">View</a>
                <a [routerLink]="['/book', tutor.tutorId]" class="premium-btn premium-btn--primary premium-btn--compact">Book Demo</a>
              </div>
            </article>
          } @empty {
            <div class="glass-strong rounded-3xl p-8 text-muted-foreground md:col-span-2 xl:col-span-3">
              No matched tutors found for this report yet.
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class InsightMatchedTutorsComponent implements OnInit {
  tutors: InsightMatchedTutorCard[] = [];
  loading = true;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const reportId = this.route.snapshot.paramMap.get('reportId') ?? '';
    this.api.insightMatchedTutors(reportId).subscribe({
      next: tutors => {
        this.tutors = tutors;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Matched tutors could not be loaded for this report.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
