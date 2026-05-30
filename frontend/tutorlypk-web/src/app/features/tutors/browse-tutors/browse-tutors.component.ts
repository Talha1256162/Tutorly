import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { LookupValue, TutorSearchFilters, TutorSummary } from '../../../core/models/api.models';
import { FilterSidebarComponent } from '../../../shared/components/filter-sidebar/filter-sidebar.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { TutorCardComponent } from '../../../shared/components/tutor-card/tutor-card.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-browse-tutors',
  standalone: true,
  imports: [FilterSidebarComponent, SearchBarComponent, TutorCardComponent, IconComponent],
  template: `
    <section class="mx-auto max-w-7xl px-6 py-6">
      <app-search-bar [value]="query.search ?? ''" [sort]="query.sort ?? 'top-rated'" (searchChange)="search($event)" (sortChange)="sort($event)" />

      <div class="grid lg:grid-cols-[280px_1fr] gap-6 mt-8">
        <app-filter-sidebar class="hidden lg:block" [lookup]="lookups" [resetVersion]="filterResetVersion" (filtersChange)="applyFilters($event)" />
        <div>
          <div class="flex items-center justify-between mb-5">
            <h1 class="font-display text-4xl font-bold">{{ tutors.length }} tutors</h1>
            @if (tutors.length > 0) {
              <div class="hidden md:flex items-center gap-2 text-cyan text-sm font-semibold"><app-icon name="sparkles" className="h-4 w-4" /> {{ recommendedCount }} AI-recommended for you</div>
            }
          </div>
          @if (activeFilters.length) {
            <div class="flex flex-wrap items-center gap-2 mb-5">
              @for (filter of activeFilters; track filter) {
                <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">{{ filter }}</span>
              }
              <button type="button" class="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground hover:bg-white/5" (click)="clearFilters()">Clear all</button>
            </div>
          }
          <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            @for (tutor of tutors; track tutor.id) {
              <app-tutor-card [tutor]="tutor" />
            } @empty {
              <div class="glass-strong rounded-3xl p-8 text-center md:col-span-2 xl:col-span-3">
                <app-icon name="search" className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h2 class="font-display text-2xl font-semibold">No tutors matched</h2>
                <p class="text-muted-foreground mt-2">Try removing a filter or searching a broader subject.</p>
                <button type="button" class="mt-5 premium-btn premium-btn--secondary" (click)="clearFilters()">Clear filters</button>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class BrowseTutorsComponent implements OnInit {
  tutors: TutorSummary[] = [];
  lookups: Record<string, LookupValue[]> = {};
  query: TutorSearchFilters = { sort: 'top-rated' };
  filterResetVersion = 0;

  constructor(private readonly api: ApiService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.api.lookups().subscribe(lookups => {
      this.lookups = lookups;
      this.cdr.detectChanges();
    });
    this.loadTutors();
  }

  search(value: string): void {
    this.query = { ...this.query, search: value };
    this.loadTutors();
  }

  sort(value: string): void {
    this.query = { ...this.query, sort: value };
    this.loadTutors();
  }

  applyFilters(filters: TutorSearchFilters): void {
    this.query = { ...this.query, ...filters };
    this.loadTutors();
  }

  clearFilters(): void {
    this.query = { search: '', sort: this.query.sort ?? 'top-rated' };
    this.filterResetVersion += 1;
    this.loadTutors();
  }

  get activeFilters(): string[] {
    const values = [
      ...(this.query.subjects ?? []),
      ...(this.query.classLevels ?? []),
      ...(this.query.cities ?? []),
      ...(this.query.modes ?? []),
      ...(this.query.genders ?? []),
      ...(this.query.languages ?? []),
    ];

    if (this.query.maxFee != null) {
      values.push(`Under PKR ${Math.round(this.query.maxFee / 1000)}k`);
    }

    return values;
  }

  get recommendedCount(): number {
    return Math.min(3, this.tutors.length);
  }

  private loadTutors(): void {
    this.api.tutors(this.query).subscribe(tutors => {
      this.tutors = tutors;
      this.cdr.detectChanges();
    });
  }
}
