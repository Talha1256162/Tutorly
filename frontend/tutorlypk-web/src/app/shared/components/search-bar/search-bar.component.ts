import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="glass-strong rounded-3xl px-5 py-4 flex items-center gap-3 shadow-card">
      <app-icon name="search" className="h-5 w-5 text-muted-foreground" />
      <input [(ngModel)]="value" (ngModelChange)="searchChange.emit(value)" class="flex-1 bg-transparent outline-none text-muted-foreground" placeholder="Search tutors, subjects, cities..." />
      <button class="hidden sm:inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold">
        <app-icon name="sparkles" className="h-4 w-4 text-cyan" /> AI Best Match
      </button>
      <button class="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold">Sort: Top rated</button>
    </div>
  `,
})
export class SearchBarComponent {
  value = '';
  @Output() searchChange = new EventEmitter<string>();
}
