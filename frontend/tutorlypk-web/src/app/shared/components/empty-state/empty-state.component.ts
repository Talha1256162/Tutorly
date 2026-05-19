import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: '<div class="glass-strong rounded-3xl p-8 text-muted-foreground">{{ message }}</div>',
})
export class EmptyStateComponent {
  @Input() message = 'Nothing here yet.';
}
