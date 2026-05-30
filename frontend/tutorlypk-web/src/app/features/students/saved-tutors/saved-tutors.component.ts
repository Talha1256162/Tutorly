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
        @for (tutor of tutors; track tutor.id) {
          <app-tutor-card [tutor]="tutor" [saved]="true" (removed)="removeTutor($event)" />
        } @empty {
          <div class="glass-strong rounded-3xl p-10 text-center md:col-span-2 lg:col-span-3">
            <h2 class="font-display text-2xl font-semibold">No saved tutors yet</h2>
            <p class="text-muted-foreground mt-2">Use the heart button on tutor cards to keep your shortlist here.</p>
          </div>
        }
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

  removeTutor(tutorId: string): void {
    this.tutors = this.tutors.filter(tutor => tutor.id !== tutorId);
    this.cdr.detectChanges();
  }
}
