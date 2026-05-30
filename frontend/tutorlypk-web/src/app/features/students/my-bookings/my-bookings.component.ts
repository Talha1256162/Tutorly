import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { BookingSummary } from '../../../core/models/api.models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (bookings) {
      <section class="mx-auto max-w-7xl px-6 py-8">
        <div class="glass-strong rounded-3xl p-8 shadow-card bg-hero-gradient">
          <div class="text-cyan text-xs font-bold uppercase tracking-wider mb-2">My bookings</div>
          <h1 class="font-display text-4xl font-bold">Demo classes and active sessions.</h1>
          <p class="text-muted-foreground mt-2">Track upcoming demos before committing to a teacher.</p>
        </div>

        <div class="grid md:grid-cols-2 gap-5 mt-8">
          @for (booking of bookings; track booking.id) {
            <article class="glass-strong rounded-3xl p-6 shadow-card">
              <div class="flex items-start gap-4">
                <img [src]="booking.tutorPhotoUrl" class="h-16 w-16 rounded-2xl object-cover" />
                <div class="flex-1 min-w-0">
                  <h2 class="font-display text-xl font-semibold">{{ booking.tutorName }}</h2>
                  <p class="text-muted-foreground">{{ booking.subjects.join(', ') }}</p>
                  <p class="text-sm text-muted-foreground mt-1">{{ booking.bookingDate }} at {{ booking.bookingTime }} - {{ booking.teachingMode }}</p>
                </div>
                <span class="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs text-primary capitalize">{{ booking.status }}</span>
              </div>
              <p class="mt-5 text-sm text-muted-foreground">{{ booking.learningGoal }}</p>
              <div class="mt-6 flex flex-wrap gap-3">
                <a [routerLink]="['/tutors', booking.tutorId]" class="premium-btn premium-btn--secondary premium-btn--compact">View tutor</a>
                <button class="premium-btn premium-btn--primary premium-btn--compact">View details</button>
              </div>
            </article>
          } @empty {
            <div class="glass-strong rounded-3xl p-8 text-muted-foreground">No bookings yet.</div>
          }
        </div>
      </section>
    }
  `,
})
export class MyBookingsComponent implements OnInit {
  bookings?: BookingSummary[];

  constructor(private readonly api: ApiService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.api.myBookings().subscribe(bookings => {
      this.bookings = bookings;
      this.cdr.detectChanges();
    });
  }
}
