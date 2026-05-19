import { Component, Input } from '@angular/core';
import { StatCard } from '../../../core/models/api.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="glass-strong rounded-3xl p-6 shadow-card">
      <app-icon [name]="stat.icon" className="h-5 w-5 text-primary mb-4" />
      <div class="text-muted-foreground text-sm">{{ stat.label }}</div>
      <div class="font-display text-3xl font-bold mt-2">{{ stat.value }}</div>
      <div class="text-xs mt-2" [class.text-success]="stat.tone === 'success'" [class.text-warning]="stat.tone === 'warning'" [class.text-cyan]="stat.tone === 'cyan'">{{ stat.caption }}</div>
    </div>
  `,
})
export class StatsCardComponent {
  @Input({ required: true }) stat!: StatCard;
}
