import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { TutorSummary } from '../../../core/models/api.models';
import { TutorCardComponent } from '../../../shared/components/tutor-card/tutor-card.component';

@Component({
  selector: 'app-saved-tutors',
  standalone: true,
  imports: [TutorCardComponent],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-8">
      <div class="glass-strong rounded-3xl p-8 shadow-card bg-hero-gradient">
        <div class="text-cyan text-xs font-bold uppercase tracking-wider mb-2">Saved tutors</div>
        <h1 class="font-display text-4xl font-bold">Tutors you kept for later.</h1>
        <p class="text-muted-foreground mt-2">Quickly compare profiles, response times, fees, and available demo slots.</p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        @for (tutor of tutors; track tutor.id) { <app-tutor-card [tutor]="tutor" /> }
      </div>
    </section>
  `,
})
export class SavedTutorsComponent implements OnInit {
  tutors: TutorSummary[] = [];
  constructor(private readonly api: ApiService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.api.savedTutors().subscribe(tutors => {
      this.tutors = tutors;
      this.cdr.detectChanges();
    });
  }
}
