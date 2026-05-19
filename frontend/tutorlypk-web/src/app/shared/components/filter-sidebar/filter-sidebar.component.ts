import { Component, Input } from '@angular/core';
import { LookupValue } from '../../../core/models/api.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [IconComponent],
  template: `
    <aside class="glass-strong rounded-3xl p-6 shadow-card h-fit">
      <h3 class="font-display font-semibold flex items-center gap-2 mb-6">
        <app-icon name="sliders" className="h-4 w-4" /> Filters
      </h3>
      <div class="space-y-6 text-sm">
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">Subject</div>
          @for (item of subjects; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2"><input type="checkbox" /> {{ item.name }}</label>
          }
        </section>
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">Class</div>
          @for (item of classLevels; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2"><input type="checkbox" /> {{ item.name }}</label>
          }
        </section>
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">City</div>
          @for (item of cities; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2"><input type="checkbox" /> {{ item.name }}</label>
          }
        </section>
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">Budget / month</div>
          <input type="range" class="w-full" />
          <div class="flex justify-between text-xs text-muted-foreground mt-2"><span>PKR 5k</span><span>PKR 30k</span></div>
        </section>
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">Mode</div>
          @for (item of modes; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2"><input type="checkbox" /> {{ item.name }}</label>
          }
        </section>
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">Gender</div>
          @for (item of genders; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2"><input type="checkbox" /> {{ item.name }}</label>
          }
        </section>
        <section>
          <div class="text-xs uppercase tracking-wider text-muted-foreground mb-3">Languages</div>
          @for (item of languages; track item.code) {
            <label class="flex items-center gap-2 text-muted-foreground mb-2"><input type="checkbox" /> {{ item.name }}</label>
          }
        </section>
      </div>
    </aside>
  `,
})
export class FilterSidebarComponent {
  @Input() lookup: Record<string, LookupValue[]> = {};

  get subjects(): LookupValue[] { return (this.lookup['subject'] ?? []).slice(0, 5); }
  get classLevels(): LookupValue[] { return this.lookup['class_level'] ?? []; }
  get cities(): LookupValue[] { return (this.lookup['city'] ?? []).slice(0, 6); }
  get modes(): LookupValue[] { return this.lookup['teaching_mode'] ?? []; }
  get genders(): LookupValue[] { return this.lookup['gender'] ?? []; }
  get languages(): LookupValue[] { return this.lookup['language'] ?? []; }
}
