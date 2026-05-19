import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  template: `
    <section class="glass-strong rounded-3xl p-7 shadow-card">
      @if (title) { <h2 class="font-display text-xl font-semibold mb-5">{{ title }}</h2> }
      <ng-content />
    </section>
  `,
})
export class DashboardCardComponent {
  @Input() title = '';
}
