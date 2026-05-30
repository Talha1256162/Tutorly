import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TutorSummary } from '../../../core/models/api.models';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { IconComponent } from '../icon/icon.component';
import { isReliableImageUrl } from '../../image-utils';

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
      <button
        type="button"
        class="premium-icon-btn tutor-save-button"
        [class.tutor-save-button--active]="isSaved"
        [disabled]="isSaving"
        [attr.aria-label]="isSaved ? 'Remove saved tutor' : 'Save tutor'"
        [attr.title]="isSaved ? 'Remove saved tutor' : 'Save tutor'"
        (click)="toggleSaved()"
      >
        <app-icon name="heart" className="h-4 w-4" />
      </button>

      <div class="flex items-start gap-4">
        <div class="relative shrink-0">
          <div class="tutor-avatar">
            @if (showImage) {
              <img [src]="tutor.photoUrl" [alt]="tutor.name" (error)="markImageFailed()" />
            } @else {
              <span class="tutor-avatar-fallback">{{ tutor.initials }}</span>
            }
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

      <div class="tutor-card-footer">
        <div class="tutor-card-price">
          <div class="font-display font-bold text-lg leading-tight">{{ tutor.feeText }}</div>
          <div class="flex items-center gap-1 text-xs text-muted-foreground">
            <app-icon name="clock" className="h-3.5 w-3.5" /> {{ tutor.nextSlot }}
          </div>
        </div>
        <div class="tutor-card-actions">
          <a [routerLink]="['/tutors', tutor.id]" class="premium-btn premium-btn--secondary premium-btn--compact">View</a>
          <a [routerLink]="['/book', tutor.id]" class="premium-btn premium-btn--primary premium-btn--compact">Book Demo</a>
        </div>
      </div>
    </div>
  `,
})
export class TutorCardComponent {
  @Input({ required: true }) tutor!: TutorSummary;
  @Input() saved = false;
  @Output() removed = new EventEmitter<string>();
  imageFailed = false;
  isSaving = false;

  constructor(
    private readonly api: ApiService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get isSaved(): boolean {
    return this.saved;
  }

  get showImage(): boolean {
    return !this.imageFailed && isReliableImageUrl(this.tutor.photoUrl);
  }

  markImageFailed(): void {
    this.imageFailed = true;
  }

  toggleSaved(): void {
    if (!this.authService.isSignedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.isSaving = true;
    const request = this.isSaved
      ? this.api.removeSavedTutor(this.tutor.id)
      : this.api.saveTutor(this.tutor.id);

    request.subscribe({
      next: () => {
        if (this.isSaved) {
          this.removed.emit(this.tutor.id);
        }
        this.saved = !this.saved;
        this.isSaving = false;
      },
      error: error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
        this.isSaving = false;
      },
    });
  }
}
