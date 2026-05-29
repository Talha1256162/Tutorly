import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { InsightLearningGapReport } from '../../../core/models/api.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-insight-report',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-8">
      @if (report) {
        <div class="glass-strong rounded-3xl p-8 shadow-card bg-hero-gradient">
          <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div class="text-cyan text-xs font-bold uppercase tracking-wider mb-2">Learning Gap Report</div>
              <h1 class="font-display text-4xl font-bold">{{ report.childName }}'s Tutorly Insight Report</h1>
              <p class="text-muted-foreground mt-3 max-w-3xl">{{ report.parentExplanation }}</p>
            </div>
            <a [routerLink]="['/insight/matched-tutors', report.reportId]" class="inline-flex items-center gap-2 rounded-xl bg-primary-gradient px-6 py-3.5 font-semibold text-primary-foreground shadow-glow">
              Matched Tutors
              <app-icon name="arrow-right" className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-5 mt-8">
          <div class="glass-strong rounded-3xl p-6 shadow-card">
            <div class="text-muted-foreground text-sm">Overall Learning Score</div>
            <div class="font-display text-4xl font-bold mt-2">{{ report.overallLearningScore }}%</div>
            <div class="text-xs text-cyan mt-2">Actual Learning Level</div>
          </div>
          <div class="glass-strong rounded-3xl p-6 shadow-card">
            <div class="text-muted-foreground text-sm">Current Class</div>
            <div class="font-display text-4xl font-bold mt-2">Class {{ report.currentClass }}</div>
            <div class="text-xs text-muted-foreground mt-2">School enrollment level</div>
          </div>
          <div class="glass-strong rounded-3xl p-6 shadow-card">
            <div class="text-muted-foreground text-sm">Estimated Actual Level</div>
            <div class="font-display text-4xl font-bold mt-2">Class {{ report.estimatedActualLevel }}</div>
            <div class="text-xs text-warning mt-2">Learning foundation estimate</div>
          </div>
        </div>

        <div class="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 mt-8">
          <section class="glass-strong rounded-3xl p-7 shadow-card">
            <h2 class="font-display text-2xl font-semibold">Subject-wise scores</h2>
            <div class="space-y-5 mt-6">
              @for (subject of report.subjectScores; track subject.subjectCode) {
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="font-semibold">{{ subject.subjectName }}</span>
                    <span class="text-muted-foreground">{{ subject.score }}% - Level {{ subject.estimatedLevel }}</span>
                  </div>
                  <div class="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div class="h-full bg-aurora" [style.width.%]="subject.score"></div>
                  </div>
                </div>
              }
            </div>
          </section>

          <section class="glass-strong rounded-3xl p-7 shadow-card">
            <h2 class="font-display text-2xl font-semibold">Recommended Next Action</h2>
            <p class="text-muted-foreground mt-4">{{ report.recommendedTutorType }}</p>
            <div class="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div class="text-xs text-cyan font-bold uppercase tracking-wider">30-day improvement plan</div>
              <p class="mt-3 leading-relaxed">{{ report.thirtyDayPlan }}</p>
            </div>
          </section>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mt-8">
          <section class="glass-strong rounded-3xl p-7 shadow-card">
            <h2 class="font-display text-xl font-semibold mb-5">Weak topics</h2>
            <div class="flex flex-wrap gap-3">
              @for (topic of report.weakTopics; track topic.subjectCode + topic.topicCode) {
                <span class="rounded-full border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning">{{ topic.topicName }} - {{ topic.score }}%</span>
              }
            </div>
          </section>
          <section class="glass-strong rounded-3xl p-7 shadow-card">
            <h2 class="font-display text-xl font-semibold mb-5">Strong topics</h2>
            <div class="flex flex-wrap gap-3">
              @for (topic of report.strongTopics; track topic.subjectCode + topic.topicCode) {
                <span class="rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">{{ topic.topicName }} - {{ topic.score }}%</span>
              }
              @if (report.strongTopics.length === 0) {
                <span class="text-muted-foreground text-sm">Strong topics will appear after more correct answers.</span>
              }
            </div>
          </section>
        </div>
      } @else {
        <div class="glass-strong rounded-3xl p-8 shadow-card">Loading Tutorly Insight report...</div>
      }
    </section>
  `,
})
export class InsightReportComponent implements OnInit {
  report?: InsightLearningGapReport;

  constructor(private readonly route: ActivatedRoute, private readonly api: ApiService) {}

  ngOnInit(): void {
    const attemptId = this.route.snapshot.paramMap.get('attemptId') ?? '';
    this.api.insightReportByAttempt(attemptId).subscribe(report => {
      this.report = report;
    });
  }
}
