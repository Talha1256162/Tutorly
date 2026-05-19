import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TutorSummary } from '../../../core/models/api.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-tutor-card',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="group relative glass rounded-3xl p-5 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 shadow-card h-full">
      @if (tutor.matchPercentage) {
        <div class="absolute -top-2 -right-2 bg-primary-gradient text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-glow">
          <app-icon name="sparkles" className="h-3 w-3" /> {{ tutor.matchPercentage }}% MATCH
        </div>
      }

      <div class="flex items-start gap-4">
        <div class="relative shrink-0">
          <div class="h-16 w-16 rounded-2xl bg-aurora p-[2px]">
            <img [src]="tutor.photoUrl" [alt]="tutor.name" class="h-full w-full rounded-2xl object-cover bg-surface" />
          </div>
          @if (tutor.verified) {
            <div class="absolute -bottom-1 -right-1 bg-success rounded-full p-0.5 ring-2 ring-background">
              <app-icon name="shield-check" className="h-3.5 w-3.5 text-background" />
            </div>
          }
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-display font-semibold text-base truncate">{{ tutor.name }}</h3>
          <p class="text-xs text-muted-foreground line-clamp-1 mt-0.5">{{ tutor.tagline }}</p>
          <div class="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span class="flex items-center gap-1">
              <app-icon name="star" className="h-3.5 w-3.5 fill-warning text-warning" />
              <span class="text-foreground font-semibold">{{ tutor.rating }}</span> ({{ tutor.reviews }})
            </span>
            <span class="flex items-center gap-1"><app-icon name="map-pin" className="h-3.5 w-3.5" /> {{ tutor.city }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 mt-4">
        @for (subject of tutor.subjects; track subject) {
          <span class="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-muted-foreground">{{ subject }}</span>
        }
        <span class="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">{{ tutor.teachingMode }}</span>
      </div>

      @if (tutor.matchReason) {
        <div class="flex items-start gap-1.5 mt-4 text-xs text-cyan font-medium">
          <app-icon name="sparkles" className="h-3.5 w-3.5 mt-0.5" />
          <span>{{ tutor.matchReason }}</span>
        </div>
      }

      <div class="mt-5 pt-5 border-t border-white/5 flex items-end gap-3">
        <div class="min-w-0">
          <div class="font-display font-bold text-lg leading-tight">{{ tutor.feeText }}</div>
          <div class="flex items-center gap-1 text-xs text-muted-foreground">
            <app-icon name="clock" className="h-3.5 w-3.5" /> {{ tutor.nextSlot }}
          </div>
        </div>
        <a [routerLink]="['/tutors', tutor.id]" class="ml-auto px-4 py-2.5 rounded-2xl border border-white/10 text-sm font-semibold hover:bg-white/5">View</a>
        <a [routerLink]="['/book', tutor.id]" class="px-4 py-2.5 rounded-2xl bg-primary-gradient text-primary-foreground text-sm font-semibold shadow-glow">Book Demo</a>
      </div>
    </div>
  `,
})
export class TutorCardComponent {
  @Input({ required: true }) tutor!: TutorSummary;
}
