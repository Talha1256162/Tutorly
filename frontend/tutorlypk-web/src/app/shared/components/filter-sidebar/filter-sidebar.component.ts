import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LookupValue, TutorSearchFilters } from '../../../core/models/api.models';
import { IconComponent } from '../icon/icon.component';

type MultiFilterKey = 'subjects' | 'classLevels' | 'cities' | 'modes' | 'genders' | 'languages';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <aside class="glass-strong rounded-3xl p-6 shadow-card h-fit premium-filter">
      <div class="flex items-center justify-between gap-3 mb-6">
        <h3 class="font-display font-semibold flex items-center gap-2">
          <app-icon name="sliders" className="h-4 w-4" /> Filters
        </h3>
        <button type="button" class="auth-link text-xs" (click)="reset()">Reset</button>
      </div>
      <div class="space-y-6 text-sm">
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">Subject</div>
          @for (item of subjects; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2">
              <input type="checkbox" [checked]="isSelected('subjects', item.name)" (change)="toggle('subjects', item.name, $any($event.target).checked)" />
              {{ item.name }}
            </label>
          }
        </section>
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">Class</div>
          @for (item of classLevels; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2">
              <input type="checkbox" [checked]="isSelected('classLevels', item.name)" (change)="toggle('classLevels', item.name, $any($event.target).checked)" />
              {{ item.name }}
            </label>
          }
        </section>
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">City</div>
          @for (item of cities; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2">
              <input type="checkbox" [checked]="isSelected('cities', item.name)" (change)="toggle('cities', item.name, $any($event.target).checked)" />
              {{ item.name }}
            </label>
          }
        </section>
        <section>
          <div class="flex items-center justify-between gap-3 mb-3">
            <div class="text-xs uppercase tracking-wider text-muted-foreground">Budget / month</div>
            <label class="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" [(ngModel)]="budgetEnabled" (ngModelChange)="emitFilters()" />
              Use
            </label>
          </div>
          <input type="range" min="5000" max="30000" step="1000" [(ngModel)]="maxFee" (ngModelChange)="enableBudget()" class="w-full" />
          <div class="flex justify-between text-xs text-muted-foreground mt-2"><span>PKR 5k</span><span>{{ budgetLabel }}</span></div>
        </section>
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">Mode</div>
          @for (item of modes; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2">
              <input type="checkbox" [checked]="isSelected('modes', item.name)" (change)="toggle('modes', item.name, $any($event.target).checked)" />
              {{ item.name }}
            </label>
          }
        </section>
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">Gender</div>
          @for (item of genders; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2">
              <input type="checkbox" [checked]="isSelected('genders', item.name)" (change)="toggle('genders', item.name, $any($event.target).checked)" />
              {{ item.name }}
            </label>
          }
        </section>
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">Languages</div>
          @for (item of languages; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2">
              <input type="checkbox" [checked]="isSelected('languages', item.name)" (change)="toggle('languages', item.name, $any($event.target).checked)" />
              {{ item.name }}
            </label>
          }
        </section>
      </div>
    </aside>
  `,
})
export class FilterSidebarComponent implements OnChanges {
  @Input() lookup: Record<string, LookupValue[]> = {};
  @Input() resetVersion = 0;
  @Output() filtersChange = new EventEmitter<TutorSearchFilters>();

  maxFee = 30000;
  budgetEnabled = false;
  private readonly selected: Record<MultiFilterKey, string[]> = {
    subjects: [],
    classLevels: [],
    cities: [],
    modes: [],
    genders: [],
    languages: [],
  };

  get subjects(): LookupValue[] { return (this.lookup['subject'] ?? []).slice(0, 5); }
  get classLevels(): LookupValue[] { return this.lookup['class_level'] ?? []; }
  get cities(): LookupValue[] { return (this.lookup['city'] ?? []).slice(0, 6); }
  get modes(): LookupValue[] { return this.lookup['teaching_mode'] ?? []; }
  get genders(): LookupValue[] { return this.lookup['gender'] ?? []; }
  get languages(): LookupValue[] { return this.lookup['language'] ?? []; }
  get budgetLabel(): string { return `PKR ${Math.round(this.maxFee / 1000)}k`; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetVersion'] && !changes['resetVersion'].firstChange) {
      this.reset();
    }
  }

  isSelected(key: MultiFilterKey, value: string): boolean {
    return this.selected[key].includes(value);
  }

  toggle(key: MultiFilterKey, value: string, checked: boolean): void {
    const nextValues = new Set(this.selected[key]);

    if (checked) {
      nextValues.add(value);
    } else {
      nextValues.delete(value);
    }

    this.selected[key] = [...nextValues];
    this.emitFilters();
  }

  enableBudget(): void {
    this.budgetEnabled = true;
    this.emitFilters();
  }

  reset(): void {
    this.maxFee = 30000;
    this.budgetEnabled = false;
    Object.keys(this.selected).forEach(key => {
      this.selected[key as MultiFilterKey] = [];
    });
    this.emitFilters();
  }

  emitFilters(): void {
    this.filtersChange.emit({
      subjects: this.selected.subjects,
      classLevels: this.selected.classLevels,
      cities: this.selected.cities,
      modes: this.selected.modes,
      genders: this.selected.genders,
      languages: this.selected.languages,
      maxFee: this.budgetEnabled ? this.maxFee : null,
    });
  }
}
