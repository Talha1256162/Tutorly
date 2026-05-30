import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { BookingOption } from '../../../core/models/api.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { initialsFromName, isReliableImageUrl } from '../../../shared/image-utils';

@Component({
  selector: 'app-book-demo',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent],
  template: `
    @if (options) {
      <section class="mx-auto max-w-6xl px-6 py-8">
        <a [routerLink]="['/tutors', options.tutorId]" class="auth-link text-sm">&lt;- Back to profile</a>
        <h1 class="font-display text-5xl font-bold tracking-tight mt-5">Book a free demo with <span class="text-gradient">{{ firstName }}</span></h1>
        <p class="text-muted-foreground text-lg mt-3">30 minutes, no charge, no commitment. Test before you commit.</p>

        <div class="grid lg:grid-cols-[1fr_360px] gap-8 mt-10 items-start">
          <div class="space-y-6">
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold flex items-center gap-2 mb-5"><app-icon name="calendar" className="h-5 w-5 text-primary" /> 1. Pick a date</h2>
              <div class="grid grid-cols-3 md:grid-cols-7 gap-2">
                @for (date of options.dates; track date.isoDate) {
                  <button (click)="selectedDate = date.isoDate" class="premium-choice p-4 text-center" [class.premium-choice-active]="selectedDate === date.isoDate">
                    <div class="text-xs text-muted-foreground font-semibold">{{ date.label }}</div>
                    <div class="font-display text-2xl font-bold mt-1">{{ date.day }}</div>
                  </button>
                }
              </div>
            </section>

            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold flex items-center gap-2 mb-5"><app-icon name="clock" className="h-5 w-5 text-primary" /> 2. Pick a time slot</h2>
              <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
                @for (slot of options.timeSlots; track slot) {
                  <button (click)="selectedTime = slot" class="premium-choice px-5 py-3 font-semibold" [class.premium-choice-active]="slot === selectedTime">{{ slot }}</button>
                }
              </div>
            </section>

            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold flex items-center gap-2 mb-5"><app-icon name="video" className="h-5 w-5 text-primary" /> 3. Mode</h2>
              <div class="grid md:grid-cols-2 gap-4">
                @for (mode of options.modes; track mode) {
                  <button (click)="selectedMode = mode" class="premium-choice p-5 text-left" [class.ring-glow]="mode === selectedMode">
                    <app-icon [name]="mode === 'Online' ? 'video' : 'house'" className="h-5 w-5 text-primary mb-3" />
                    <div class="font-semibold">{{ mode }}</div>
                    <div class="text-sm text-muted-foreground">{{ mode === 'Online' ? 'Mentora video room' : 'Tutor visits your home' }}</div>
                  </button>
                }
              </div>
            </section>

            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <h2 class="font-display text-xl font-semibold flex items-center gap-2 mb-5"><app-icon name="sparkles" className="h-5 w-5 text-primary" /> 4. Tell the tutor about the learner</h2>
              <div class="grid md:grid-cols-2 gap-3 mb-3">
                <label class="premium-field">
                  <span>Student name</span>
                  <input [(ngModel)]="studentName" class="w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" placeholder="Student name" autocomplete="name" aria-required="true" />
                </label>
                <label class="premium-field">
                  <span>Parent phone</span>
                  <input [(ngModel)]="parentPhone" class="w-full rounded-3xl bg-white/5 border border-white/10 px-5 py-4 outline-none text-muted-foreground" placeholder="Parent phone" autocomplete="tel" aria-required="true" />
                </label>
              </div>
              <label class="premium-field">
                <span>Learning goal</span>
                <textarea [(ngModel)]="goal" class="min-h-[100px] w-full rounded-3xl bg-white/5 border border-white/10 p-5 outline-none text-muted-foreground" placeholder="What's the goal? Any specific topics?" aria-required="true"></textarea>
              </label>
            </section>
          </div>

          <aside class="lg:sticky lg:top-28 space-y-5">
            <section class="glass-strong rounded-3xl p-7 shadow-card">
              <div class="flex items-center gap-4 mb-6">
                @if (showTutorImage) {
                  <img [src]="options.tutorPhotoUrl" [alt]="options.tutorName" class="h-16 w-16 rounded-2xl object-cover" />
                } @else {
                  <div class="premium-avatar-fallback h-16 w-16 rounded-2xl">{{ tutorInitials }}</div>
                }
                <div><div class="font-display text-xl font-bold">{{ options.tutorName }}</div><div class="text-sm text-muted-foreground">{{ options.subjects.join(', ') }}</div></div>
              </div>
              <div class="space-y-4 text-sm">
                <div class="flex justify-between"><span class="text-muted-foreground">Date</span><b>{{ selectedDateLabel }}</b></div>
                <div class="flex justify-between"><span class="text-muted-foreground">Time</span><b>{{ selectedTime }}</b></div>
                <div class="flex justify-between"><span class="text-muted-foreground">Mode</span><b>{{ selectedMode }}</b></div>
                <div class="flex justify-between"><span class="text-muted-foreground">Duration</span><b>30 min</b></div>
                <div class="border-t border-white/5 pt-4 flex justify-between"><span class="text-muted-foreground">Demo class</span><b class="text-success text-xl">Free</b></div>
              </div>
              <button (click)="confirmBooking()" [disabled]="isSubmitting" class="mt-6 premium-btn premium-btn--primary w-full">{{ isSubmitting ? 'Requesting...' : 'Confirm booking' }}</button>
              @if (confirmationMessage) {
                <div class="mt-4 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">{{ confirmationMessage }}</div>
              }
              @if (errorMessage) {
                <div class="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{{ errorMessage }}</div>
              }
              <div class="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4"><app-icon name="shield-check" className="h-3.5 w-3.5 text-success" /> Free cancellation up to 2 hrs before</div>
            </section>
            <section class="glass-strong rounded-3xl p-6 shadow-card space-y-3 text-sm">
              @for (note of options.safetyNotes; track note) {
                <div class="flex items-center gap-2"><app-icon name="check" className="h-4 w-4 text-success" /> {{ note }}</div>
              }
            </section>
          </aside>
        </div>
      </section>
    }
  `,
})
export class BookDemoComponent implements OnInit {
  options?: BookingOption;
  firstName = '';
  selectedDate = '';
  selectedTime = '6:00 PM';
  selectedMode = 'Online';
  studentName = '';
  parentPhone = '';
  goal = '';
  isSubmitting = false;
  confirmationMessage = '';
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  get selectedDateLabel(): string {
    const date = this.options?.dates.find(item => item.isoDate === this.selectedDate);
    return date ? `${date.label} ${date.day}` : 'Select date';
  }

  get showTutorImage(): boolean {
    return isReliableImageUrl(this.options?.tutorPhotoUrl);
  }

  get tutorInitials(): string {
    return initialsFromName(this.options?.tutorName);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? 'ayesha-malik';
    this.api.bookingOptions(id).subscribe(options => {
      this.options = options;
      this.firstName = options.tutorName.split(' ')[0];
      this.selectedDate = options.dates[2]?.isoDate ?? options.dates[0]?.isoDate ?? '';
      this.cdr.detectChanges();
    });
  }

  confirmBooking(): void {
    if (!this.options) {
      return;
    }

    if (!this.isBookingComplete()) {
      this.errorMessage = 'Please add student name, parent phone, and learning goal before confirming.';
      this.confirmationMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.confirmationMessage = '';

    this.api.createDemoBooking({
      tutorId: this.options.tutorId,
      selectedDate: this.selectedDate,
      selectedTime: this.selectedTime,
      mode: this.selectedMode,
      studentName: this.studentName,
      parentPhone: this.parentPhone,
      learningGoal: this.goal,
    }).subscribe({
      next: confirmation => {
        this.confirmationMessage = confirmation.message;
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Please sign in before confirming this demo booking.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  private isBookingComplete(): boolean {
    return [
      this.selectedDate,
      this.selectedTime,
      this.selectedMode,
      this.studentName,
      this.parentPhone,
      this.goal,
    ].every(value => value.trim().length > 0);
  }
}
