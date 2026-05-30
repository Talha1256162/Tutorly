import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { InsightDiagnosticQuestion, InsightDiagnosticSetup } from '../../../core/models/api.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-insight-diagnostic',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-8">
      <div class="glass-strong rounded-3xl p-8 shadow-card bg-hero-gradient premium-dashboard-hero">
        <div class="premium-hero-row">
          <div>
            <div class="text-cyan text-xs font-bold uppercase tracking-wider mb-2">Tutorly Insight</div>
            <h1 class="font-display text-4xl font-bold">Start Free Level Check</h1>
            <p class="text-muted-foreground mt-2 max-w-2xl">Tutor lagane se pehle bachay ka real learning level samjhein.</p>
          </div>
          <a routerLink="/dashboard" class="premium-btn premium-btn--secondary">
            Back to dashboard
          </a>
        </div>
      </div>

      @if (!attemptId) {
        <div class="grid lg:grid-cols-[1fr_0.8fr] gap-6 mt-8">
          <section class="glass-strong rounded-3xl p-7 shadow-card">
            <h2 class="font-display text-2xl font-semibold">Diagnostic setup</h2>
            <div class="grid md:grid-cols-2 gap-5 mt-6">
              <label class="block">
                <span class="text-sm text-muted-foreground">Selected child</span>
                <select class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3" [(ngModel)]="selectedChildId">
                  @for (child of setup?.children ?? []; track child.childId) {
                    <option [value]="child.childId">{{ child.childName }} - Class {{ child.currentClass }}</option>
                  }
                </select>
              </label>
              <label class="block">
                <span class="text-sm text-muted-foreground">Current class</span>
                <select class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3" [(ngModel)]="currentClass">
                  @for (item of setup?.classes ?? classes; track item) {
                    <option [ngValue]="item">Class {{ item }}</option>
                  }
                </select>
              </label>
            </div>

            <div class="mt-6">
              <div class="text-sm text-muted-foreground mb-3">Subjects</div>
              <div class="premium-chip-row flex flex-wrap gap-3">
                @for (subject of subjects; track subject) {
                  <label class="inline-flex items-center gap-2 px-4 py-2 text-sm">
                    <input type="checkbox" [checked]="selectedSubjects.includes(subject)" (change)="toggleSubject(subject)" />
                    {{ subjectLabel(subject) }}
                  </label>
                }
              </div>
            </div>

            @if (error) {
              <div class="mt-5 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">{{ error }}</div>
            }

            <button class="mt-7 premium-btn premium-btn--primary" (click)="start()" [disabled]="loading || setupLoading || !selectedChildId || selectedSubjects.length === 0">
              <app-icon name="zap" className="h-4 w-4" />
              Start Diagnostic Test
            </button>
          </section>

          <aside class="glass-strong rounded-3xl p-7 shadow-card">
            <div class="h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center mb-5">
              <app-icon name="shield-check" className="h-5 w-5 text-primary" />
            </div>
            <h3 class="font-display text-xl font-semibold">What parents get</h3>
            <div class="space-y-4 mt-5 text-sm text-muted-foreground">
              <div>Actual Learning Level compared with current class.</div>
              <div>Weak and strong topics for Math, English, and Urdu.</div>
              <div>Recommended Next Action and Matched Tutors.</div>
              <div>Progress Proof for monthly improvement tracking.</div>
            </div>
          </aside>
        </div>
      } @else if (currentQuestion) {
        <section class="glass-strong rounded-3xl p-7 shadow-card mt-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div class="text-xs text-cyan font-bold uppercase tracking-wider">Diagnostic Test</div>
              <h2 class="font-display text-2xl font-semibold mt-1">{{ currentQuestion.subjectName }} - {{ currentQuestion.topicName }}</h2>
            </div>
            <div class="text-sm text-muted-foreground">{{ answeredCount }} / {{ questions.length }} answered</div>
          </div>

          <div class="h-2 rounded-full bg-white/5 overflow-hidden mt-6">
            <div class="h-full bg-aurora" [style.width.%]="progressPercent"></div>
          </div>

          <div class="flex flex-wrap gap-3 mt-6">
            @for (subject of selectedSubjects; track subject) {
              <button class="premium-choice px-4 py-2 text-sm" [class.premium-choice-active]="currentQuestion.subjectCode === subject" (click)="jumpToSubject(subject)">
                {{ subjectLabel(subject) }}
              </button>
            }
          </div>

          <div class="mt-7 glass rounded-3xl p-6">
            <div class="text-sm text-muted-foreground">Question {{ currentIndex + 1 }} of {{ questions.length }}</div>
            <h3 class="font-display text-2xl font-semibold mt-3">{{ currentQuestion.questionText }}</h3>
            <div class="grid md:grid-cols-2 gap-4 mt-6">
              @for (option of currentQuestion.options; track option.id) {
                <button class="premium-choice px-5 py-4 text-left" [class.premium-choice-active]="answers[currentQuestion.id] === option.optionCode" (click)="selectOption(option.optionCode)">
                  <span class="font-semibold text-primary mr-2">{{ option.optionCode }}.</span>{{ option.optionText }}
                </button>
              }
            </div>
          </div>

          <div class="flex flex-wrap justify-between gap-3 mt-6">
            <button class="premium-btn premium-btn--secondary" (click)="previous()" [disabled]="currentIndex === 0">Previous</button>
            <div class="flex gap-3">
              <button class="premium-btn premium-btn--secondary" (click)="complete()" [disabled]="loading">Complete test</button>
              <button class="premium-btn premium-btn--primary" (click)="saveAndNext()" [disabled]="loading || !answers[currentQuestion.id]">
                {{ currentIndex === questions.length - 1 ? 'Save answer' : 'Next' }}
                <app-icon name="arrow-right" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      }
    </section>
  `,
})
export class InsightDiagnosticComponent implements OnInit {
  setup?: InsightDiagnosticSetup;
  classes = [1, 2, 3, 4, 5, 6, 7, 8];
  subjects = ['math', 'english', 'urdu'];
  selectedSubjects = ['math', 'english', 'urdu'];
  selectedChildId = '';
  currentClass = 5;
  attemptId = '';
  questions: InsightDiagnosticQuestion[] = [];
  currentIndex = 0;
  answers: Record<string, string> = {};
  loading = false;
  setupLoading = true;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  get currentQuestion(): InsightDiagnosticQuestion | undefined {
    return this.questions[this.currentIndex];
  }

  get answeredCount(): number {
    return Object.keys(this.answers).length;
  }

  get progressPercent(): number {
    return this.questions.length === 0 ? 0 : Math.round((this.answeredCount / this.questions.length) * 100);
  }

  ngOnInit(): void {
    this.api.insightSetup(this.currentClass).subscribe(setup => {
      this.setup = setup;
      const child = setup.children[0];
      if (child) {
        this.selectedChildId = child.childId;
        this.currentClass = child.currentClass;
      }
      this.setupLoading = false;
      this.cdr.detectChanges();
    });
  }

  toggleSubject(subject: string): void {
    this.selectedSubjects = this.selectedSubjects.includes(subject)
      ? this.selectedSubjects.filter(item => item !== subject)
      : [...this.selectedSubjects, subject];
  }

  subjectLabel(subject: string): string {
    return subject === 'math' ? 'Math' : subject.charAt(0).toUpperCase() + subject.slice(1);
  }

  start(): void {
    if (this.setupLoading || !this.selectedChildId || this.selectedSubjects.length === 0) {
      this.error = 'Select a child and at least one subject.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.api.startInsightDiagnostic({
      childId: this.selectedChildId,
      currentClass: this.currentClass,
      subjects: this.selectedSubjects,
    }).subscribe({
      next: response => {
        this.attemptId = response.attemptId;
        this.questions = response.questions;
        this.currentIndex = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Diagnostic test could not be started. Please sign in again or check the API.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectOption(optionCode: string): void {
    if (!this.currentQuestion) {
      return;
    }

    this.answers = { ...this.answers, [this.currentQuestion.id]: optionCode };
  }

  saveAndNext(): void {
    const question = this.currentQuestion;
    if (!question || !this.answers[question.id]) {
      return;
    }

    this.loading = true;
    this.api.submitInsightAnswer(this.attemptId, question.id, this.answers[question.id]).subscribe({
      next: () => {
        this.loading = false;
        if (this.currentIndex < this.questions.length - 1) {
          this.currentIndex += 1;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = 'Answer could not be saved.';
        this.cdr.detectChanges();
      },
    });
  }

  previous(): void {
    this.currentIndex = Math.max(0, this.currentIndex - 1);
  }

  jumpToSubject(subject: string): void {
    const index = this.questions.findIndex(question => question.subjectCode === subject);
    if (index >= 0) {
      this.currentIndex = index;
    }
  }

  complete(): void {
    if (!this.attemptId) {
      return;
    }

    this.loading = true;
    this.api.completeInsightAttempt(this.attemptId).subscribe({
      next: () => this.router.navigate(['/insight/report', this.attemptId]),
      error: () => {
        this.loading = false;
        this.error = 'Learning Gap Report could not be generated.';
        this.cdr.detectChanges();
      },
    });
  }
}
