import { Component, Input } from '@angular/core';
import {
  LucideArrowRight,
  LucideBook,
  LucideBookOpen,
  LucideCalendar,
  LucideCheck,
  LucideClock,
  LucideEllipsis,
  LucideGraduationCap,
  LucideHeart,
  LucideHouse,
  LucideMapPin,
  LucideMenu,
  LucideMessageCircle,
  LucidePaperclip,
  LucidePhone,
  LucideSearch,
  LucideSend,
  LucideShieldCheck,
  LucideSlidersHorizontal,
  LucideSparkles,
  LucideStar,
  LucideTrendingUp,
  LucideUser,
  LucideUsers,
  LucideVideo,
  LucideWallet,
  LucideZap,
} from '@lucide/angular';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [
    LucideArrowRight,
    LucideBook,
    LucideBookOpen,
    LucideCalendar,
    LucideCheck,
    LucideClock,
    LucideEllipsis,
    LucideGraduationCap,
    LucideHeart,
    LucideHouse,
    LucideMapPin,
    LucideMenu,
    LucideMessageCircle,
    LucidePaperclip,
    LucidePhone,
    LucideSearch,
    LucideSend,
    LucideShieldCheck,
    LucideSlidersHorizontal,
    LucideSparkles,
    LucideStar,
    LucideTrendingUp,
    LucideUser,
    LucideUsers,
    LucideVideo,
    LucideWallet,
    LucideZap,
  ],
  template: `
    @switch (name) {
      @case ('arrow-right') { <svg lucideArrowRight [class]="className" aria-hidden="true"></svg> }
      @case ('book') { <svg lucideBook [class]="className" aria-hidden="true"></svg> }
      @case ('book-open') { <svg lucideBookOpen [class]="className" aria-hidden="true"></svg> }
      @case ('calendar') { <svg lucideCalendar [class]="className" aria-hidden="true"></svg> }
      @case ('check') { <svg lucideCheck [class]="className" aria-hidden="true"></svg> }
      @case ('clock') { <svg lucideClock [class]="className" aria-hidden="true"></svg> }
      @case ('ellipsis') { <svg lucideEllipsis [class]="className" aria-hidden="true"></svg> }
      @case ('graduation-cap') { <svg lucideGraduationCap [class]="className" aria-hidden="true"></svg> }
      @case ('heart') { <svg lucideHeart [class]="className" aria-hidden="true"></svg> }
      @case ('house') { <svg lucideHouse [class]="className" aria-hidden="true"></svg> }
      @case ('map-pin') { <svg lucideMapPin [class]="className" aria-hidden="true"></svg> }
      @case ('menu') { <svg lucideMenu [class]="className" aria-hidden="true"></svg> }
      @case ('message-circle') { <svg lucideMessageCircle [class]="className" aria-hidden="true"></svg> }
      @case ('paperclip') { <svg lucidePaperclip [class]="className" aria-hidden="true"></svg> }
      @case ('phone') { <svg lucidePhone [class]="className" aria-hidden="true"></svg> }
      @case ('search') { <svg lucideSearch [class]="className" aria-hidden="true"></svg> }
      @case ('send') { <svg lucideSend [class]="className" aria-hidden="true"></svg> }
      @case ('shield-check') { <svg lucideShieldCheck [class]="className" aria-hidden="true"></svg> }
      @case ('sliders') { <svg lucideSlidersHorizontal [class]="className" aria-hidden="true"></svg> }
      @case ('star') { <svg lucideStar [class]="className" aria-hidden="true"></svg> }
      @case ('trending-up') { <svg lucideTrendingUp [class]="className" aria-hidden="true"></svg> }
      @case ('user') { <svg lucideUser [class]="className" aria-hidden="true"></svg> }
      @case ('users') { <svg lucideUsers [class]="className" aria-hidden="true"></svg> }
      @case ('video') { <svg lucideVideo [class]="className" aria-hidden="true"></svg> }
      @case ('wallet') { <svg lucideWallet [class]="className" aria-hidden="true"></svg> }
      @case ('zap') { <svg lucideZap [class]="className" aria-hidden="true"></svg> }
      @default { <svg lucideSparkles [class]="className" aria-hidden="true"></svg> }
    }
  `,
})
export class IconComponent {
  @Input() name = 'sparkles';
  @Input() className = 'h-4 w-4';
}
