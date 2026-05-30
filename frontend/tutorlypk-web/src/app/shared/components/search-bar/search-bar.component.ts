import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="glass-strong premium-search px-5 py-4 flex items-center gap-3 shadow-card">
      <label class="premium-search-input">
        <span class="sr-only">Search tutors</span>
        <app-icon name="search" className="h-5 w-5 text-muted-foreground" />
        <input [(ngModel)]="value" (ngModelChange)="searchChange.emit(value)" class="flex-1 bg-transparent outline-none text-muted-foreground" placeholder="Search tutors, subjects, cities..." />
      </label>
      <div class="premium-search-actions">
        <button type="button" class="inline-flex items-center gap-2 premium-btn premium-btn--secondary premium-btn--compact" (click)="useBestMatch()">
          <app-icon name="sparkles" className="h-4 w-4 text-cyan" /> AI Best Match
        </button>
        <label class="sr-only" for="tutor-sort">Sort tutors</label>
        <select
          id="tutor-sort"
          [(ngModel)]="sort"
          (ngModelChange)="sortChange.emit(sort)"
          class="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold outline-none"
        >
          <option value="top-rated">Top rated</option>
          <option value="price-low">Price low</option>
          <option value="price-high">Price high</option>
          <option value="experience">Experience</option>
          <option value="reviews">Most reviewed</option>
        </select>
      </div>
    </div>
  `,
})
export class SearchBarComponent {
  @Input() sort = 'top-rated';
  @Input() value = '';
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<string>();

  useBestMatch(): void {
    this.sort = 'top-rated';
    this.sortChange.emit(this.sort);
  }
}
