import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { LookupValue, TutorSummary } from '../../../core/models/api.models';
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
      <app-search-bar (searchChange)="search($event)" />

      <div class="grid lg:grid-cols-[280px_1fr] gap-6 mt-8">
        <app-filter-sidebar class="hidden lg:block" [lookup]="lookups" />
        <div>
          <div class="flex items-center justify-between mb-5">
            <h1 class="font-display text-4xl font-bold">{{ tutors.length }} tutors</h1>
            <div class="hidden md:flex items-center gap-2 text-cyan text-sm font-semibold"><app-icon name="sparkles" className="h-4 w-4" /> 3 AI-recommended for you</div>
          </div>
          <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            @for (tutor of tutors; track tutor.id) {
              <app-tutor-card [tutor]="tutor" />
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

  constructor(private readonly api: ApiService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.api.lookups().subscribe(lookups => {
      this.lookups = lookups;
      this.cdr.detectChanges();
    });
    this.api.tutors().subscribe(tutors => {
      this.tutors = tutors;
      this.cdr.detectChanges();
    });
  }

  search(value: string): void {
    this.api.tutors(value).subscribe(tutors => {
      this.tutors = tutors;
      this.cdr.detectChanges();
    });
  }
}
