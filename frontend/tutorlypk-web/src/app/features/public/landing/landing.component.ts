import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { LookupValue, TutorSummary } from '../../../core/models/api.models';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TutorCardComponent } from '../../../shared/components/tutor-card/tutor-card.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, IconComponent, TutorCardComponent],
  template: `
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-hero-gradient"></div>
      <div class="absolute inset-0 noise"></div>
      <div class="relative mx-auto max-w-7xl px-6 ref-hero-content pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
        <div class="animate-fade-up">
          <div class="ref-hero-badge inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-muted-foreground">
            <span class="h-2 w-2 rounded-full bg-success animate-pulse"></span>Pakistan's #1 AI-verified tutor marketplace
          </div>
          <h1 class="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
            Find the right tutor <br /><span class="text-gradient">before you waste</span> <br />another month.
          </h1>
          <p class="mt-6 text-lg text-muted-foreground max-w-xl">Mentora helps Pakistani students and parents find verified tutors through AI matching, real reviews, transparent fees, and instant demo class booking.</p>

          <div class="mt-8 glass-strong rounded-2xl p-3 shadow-card">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div class="glass rounded-xl px-3 py-2.5">
                <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground"><app-icon name="graduation-cap" className="h-4 w-4" />Subject</div>
                <div class="text-sm font-medium mt-0.5 truncate">Math, Physics</div>
              </div>
              <div class="glass rounded-xl px-3 py-2.5">
                <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground"><app-icon name="map-pin" className="h-4 w-4" />City</div>
                <div class="text-sm font-medium mt-0.5 truncate">Lahore</div>
              </div>
              <div class="glass rounded-xl px-3 py-2.5">
                <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground"><app-icon name="users" className="h-4 w-4" />Class</div>
                <div class="text-sm font-medium mt-0.5 truncate">A Levels</div>
              </div>
              <div class="glass rounded-xl px-3 py-2.5">
                <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground"><app-icon name="wallet" className="h-4 w-4" />Budget</div>
                <div class="text-sm font-medium mt-0.5 truncate">PKR 15-20k</div>
              </div>
            </div>
            <div class="flex items-center gap-2 mt-3">
              <div class="flex glass rounded-xl p-1 text-xs"><button class="px-3 py-1.5 rounded-lg bg-primary-gradient text-primary-foreground font-semibold">Online</button><button class="px-3 py-1.5 rounded-lg text-muted-foreground">Home</button></div>
              <a routerLink="/tutors" class="ml-auto inline-flex items-center gap-2 rounded-xl bg-primary-gradient px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"><app-icon name="sparkles" className="h-4 w-4" /> Find My Tutor</a>
            </div>
          </div>

          <div class="flex flex-wrap gap-3 mt-5">
            <a routerLink="/tutors" class="text-sm px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5">Browse 1,200+ tutors</a>
            <a routerLink="/role" class="text-sm px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5">Join as Tutor -></a>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/5">
            <div><div class="font-display text-2xl font-bold">1,200+</div><div class="text-xs text-muted-foreground">Verified Tutors</div></div>
            <div><div class="font-display text-2xl font-bold">8,500+</div><div class="text-xs text-muted-foreground">Students Helped</div></div>
            <div><div class="font-display text-2xl font-bold">4.9/5</div><div class="text-xs text-muted-foreground">Average Rating</div></div>
            <div><div class="font-display text-2xl font-bold">15+</div><div class="text-xs text-muted-foreground">Cities Covered</div></div>
          </div>
        </div>

        <div class="landing-showcase hidden lg:block">
          <div class="landing-ai-card animate-float">
            <div class="flex items-center gap-2 text-xs text-cyan mb-2"><app-icon name="sparkles" className="h-3 w-3" /> AI MATCH</div>
            <div class="font-display font-semibold">98% match for A Levels Math</div>
            <p class="text-xs text-muted-foreground mt-1">Ayesha M. - Lahore, 8 yrs exp.</p>
            <div class="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden"><div class="h-full w-[98%] bg-aurora animate-shimmer"></div></div>
          </div>
          @for (tutor of tutors.slice(0, 2); track tutor.id; let i = $index) {
            <div class="landing-mini-card animate-float-slow" [class.landing-mini-card-a]="i === 0" [class.landing-mini-card-b]="i === 1">
              <div class="flex items-start gap-4">
                <div class="landing-mini-avatar">{{ tutor.initials }}</div>
                <div class="min-w-0 flex-1">
                  <div class="font-display font-semibold truncate">{{ tutor.name }}</div>
                  <div class="text-xs text-muted-foreground truncate">{{ tutor.tagline }}</div>
                  <div class="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span class="flex items-center gap-1"><app-icon name="star" className="h-3.5 w-3.5 fill-warning text-warning" /> <b class="text-foreground">{{ tutor.rating }}</b> ({{ tutor.reviews }})</span>
                    <span>{{ tutor.city }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-4 border-t border-white/5 pt-4 flex items-end justify-between gap-3">
                <div>
                  <div class="font-display font-bold leading-tight">{{ tutor.feeText }}</div>
                  <div class="text-xs text-muted-foreground">{{ tutor.nextSlot }}</div>
                </div>
                <a [routerLink]="['/book', tutor.id]" class="premium-btn premium-btn--primary premium-btn--compact">Book Demo</a>
              </div>
            </div>
          }
          <div class="landing-demo-card">
            <div class="flex items-center gap-2 text-xs text-success mb-1"><app-icon name="calendar" className="h-3 w-3" /> DEMO BOOKED</div>
            <div class="font-semibold">Today, 6:00 PM</div>
            <div class="text-xs text-muted-foreground">Free 30-min trial - No commitment</div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-24 text-center">
      <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto">Finding a good tutor shouldn't feel like begging in WhatsApp groups.</h2>
      <p class="text-muted-foreground mt-4">It's 2026. The way Pakistan finds tutors is broken. We fixed it.</p>
      <div class="grid md:grid-cols-3 gap-5 mt-12 text-left">
        @for (problem of problems; track problem.title) {
          <div class="glass-strong rounded-3xl p-7 shadow-card">
            <div class="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center text-primary mb-8"><app-icon [name]="problem.icon" className="h-5 w-5" /></div>
            <h3 class="font-display font-semibold text-lg">{{ problem.title }}</h3>
            <p class="text-sm text-muted-foreground mt-2">{{ problem.body }}</p>
          </div>
        }
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-24" id="how">
      <div class="text-center mb-14">
        <div class="inline-flex glass rounded-full px-3 py-1 text-xs text-primary mb-4"><app-icon name="sparkles" className="h-3 w-3 mr-1" /> AI MATCHING</div>
        <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto">Smart Tutor Matching, Powered by AI</h2>
        <p class="text-muted-foreground mt-4 max-w-2xl mx-auto">Tell us what you need. Our AI scores every tutor on fit, results, and personality. No more guessing.</p>
      </div>
      <div class="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
        <div class="glass-strong rounded-3xl p-7 shadow-card">
          <h3 class="font-display font-semibold flex items-center gap-2 mb-5"><app-icon name="sparkles" className="h-4 w-4 text-cyan" /> Tell us about your child</h3>
          @for (row of matchRows; track row.label) {
            <div class="glass rounded-xl px-4 py-3 flex justify-between text-sm mb-3">
              <span class="text-xs uppercase tracking-wider text-muted-foreground">{{ row.label }}</span><span class="font-semibold">{{ row.value }}</span>
            </div>
          }
          <button class="w-full rounded-xl bg-primary-gradient px-5 py-3 font-semibold text-primary-foreground shadow-glow mt-2"><app-icon name="sparkles" className="h-4 w-4 inline-block mr-2" />Run AI Match</button>
        </div>
        <div>
          <div class="text-xs text-muted-foreground mb-3">Top 3 matches found in 0.8s</div>
          <div class="space-y-4">
            @for (tutor of tutors.slice(0, 3); track tutor.id) {
              <app-tutor-card [tutor]="tutor" />
            }
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-24">
      <div class="flex items-end justify-between mb-8">
        <div><div class="text-xs text-primary uppercase tracking-wider mb-2">+ TOP RATED</div><h2 class="font-display text-3xl sm:text-4xl font-bold">This week's best tutors</h2></div>
        <a routerLink="/tutors" class="text-sm text-muted-foreground">See all -></a>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        @for (tutor of tutors; track tutor.id) {
          <app-tutor-card [tutor]="tutor" />
        }
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-24 text-center">
      <div class="inline-flex glass rounded-full px-3 py-1 text-xs text-primary mb-4">+ TRUST</div>
      <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto">Built for parents who can't afford to trust random tutors.</h2>
      <p class="text-muted-foreground mt-4">Every safeguard a parent would build themselves - if they had the time.</p>
      <div class="grid md:grid-cols-4 gap-4 mt-12 text-left">
        @for (trust of trustCards; track trust.title) {
          <div class="glass-strong rounded-2xl p-5"><app-icon [name]="trust.icon" className="h-5 w-5 text-cyan mb-4" /><h3 class="font-semibold">{{ trust.title }}</h3><p class="text-xs text-muted-foreground mt-1">{{ trust.body }}</p></div>
        }
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-24 text-center">
      <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto">From searching to learning in 3 steps.</h2>
      <div class="grid md:grid-cols-3 gap-5 mt-12 text-left">
        @for (step of steps; track step.no) {
          <div class="relative glass-strong rounded-3xl p-7 overflow-hidden"><div class="absolute right-5 top-3 font-display text-8xl font-bold ghost-number">{{ step.no }}</div><div class="text-primary text-xs font-bold mb-3">{{ step.no }}</div><h3 class="font-display text-xl font-semibold">{{ step.title }}</h3><p class="text-muted-foreground mt-2">{{ step.body }}</p></div>
        }
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-24 text-center">
      <div class="inline-flex glass rounded-full px-3 py-1 text-xs text-primary mb-4">+ DASHBOARDS</div>
      <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto">Two experiences, clearly separated.</h2>
      <p class="text-muted-foreground mt-4">Students and parents share the learner workspace. Teachers manage their work through a separate portal.</p>
      <div class="grid md:grid-cols-2 gap-6 mt-12 text-left">
        <div class="glass-strong rounded-3xl p-7 shadow-card"><h3 class="font-display text-xl font-semibold mb-5">Student / Parent Workspace</h3>@for (item of ['Teacher matches','Demo classes','Learning progress','Secure messages','Saved teachers']; track item) {<div class="flex items-center gap-2 mb-2"><span class="h-4 w-4 rounded-full bg-success/20 text-success grid place-items-center text-xs">+</span>{{ item }}</div>}<a routerLink="/role" class="inline-flex items-center gap-2 rounded-xl bg-primary-gradient px-5 py-3 font-semibold text-primary-foreground shadow-glow mt-5">Continue as Student / Parent <app-icon name="arrow-right" className="h-4 w-4" /></a></div>
        <div class="glass-strong rounded-3xl p-7 shadow-card"><h3 class="font-display text-xl font-semibold mb-5">Teacher Portal</h3>@for (item of ['Student requests','Demo bookings','Earnings','Availability calendar','Profile strength','Reviews']; track item) {<div class="flex items-center gap-2 mb-2"><span class="h-4 w-4 rounded-full bg-success/20 text-success grid place-items-center text-xs">+</span>{{ item }}</div>}<a routerLink="/role" class="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-semibold mt-5">Continue as Teacher <app-icon name="arrow-right" className="h-4 w-4" /></a></div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-24 text-center">
      <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight">From Karachi to Quetta.</h2>
      <p class="text-muted-foreground mt-3">Verified tutors in every major Pakistani city - and growing fast.</p>
      <div class="flex flex-wrap justify-center gap-3 mt-8">
        @for (city of cities; track city.code) {
          <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"><app-icon name="map-pin" className="h-3.5 w-3.5 text-primary" /> {{ city.name }}</span>
        }
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-24 text-center">
      <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight">Every subject. Every level.</h2>
      <div class="grid md:grid-cols-4 gap-4 mt-12 text-left">
        @for (subject of subjects; track subject.code) {
          <div class="glass-strong rounded-2xl p-5"><div class="h-9 w-9 rounded-2xl bg-primary/10 grid place-items-center mb-5"><app-icon name="graduation-cap" className="h-4 w-4 text-cyan" /></div><h3 class="font-semibold">{{ subject.name }}</h3><p class="text-xs text-muted-foreground">120+ tutors</p></div>
        }
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-24 text-center" id="stories">
      <div class="inline-flex glass rounded-full px-3 py-1 text-xs text-primary mb-4">+ STORIES</div>
      <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto">Real Pakistani families. Real results.</h2>
      <div class="grid md:grid-cols-3 gap-5 mt-12 text-left">
        @for (story of stories; track story.name) {
          <div class="glass-strong rounded-3xl p-7 shadow-card"><div class="text-warning mb-3">*****</div><p class="leading-relaxed">"{{ story.quote }}"</p><div class="mt-6 pt-6 border-t border-white/5"><div class="font-semibold">{{ story.name }}</div><div class="text-xs text-muted-foreground">{{ story.role }} - {{ story.city }}</div></div></div>
        }
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-24">
      <div class="relative glass-strong rounded-[2rem] p-12 sm:p-16 text-center overflow-hidden shadow-card">
        <div class="absolute inset-0 bg-hero-gradient opacity-60"></div>
        <div class="relative"><app-icon name="heart" className="h-8 w-8 text-primary mx-auto mb-4" /><h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight">Stop searching randomly. <br /><span class="text-gradient">Find a tutor who actually fits.</span></h2><p class="mt-5 text-muted-foreground max-w-xl mx-auto">Free AI match. Free demo class. Pay only when you're sure.</p><div class="mt-8 flex flex-wrap justify-center gap-3"><a routerLink="/tutors" class="inline-flex items-center gap-2 rounded-xl bg-primary-gradient px-6 py-3.5 font-semibold text-primary-foreground shadow-glow"><app-icon name="zap" className="h-4 w-4" />Find My Tutor</a><a routerLink="/role" class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold hover:bg-white/10">Join as Tutor</a></div></div>
      </div>
    </section>
  `,
})
export class LandingComponent implements OnInit {
  tutors: TutorSummary[] = [];
  cities: LookupValue[] = [];
  subjects: LookupValue[] = [];
  problems = [
    { icon: 'search', title: "Students can't find trusted tutors", body: 'Endless WhatsApp groups, broken numbers, no proof of skill.' },
    { icon: 'shield-check', title: "Parents don't know who is genuine", body: 'No verification, no reviews, no accountability.' },
    { icon: 'users', title: 'Tutors struggle to find serious students', body: 'Wasted demo classes, no-shows, awkward fee talks.' },
  ];
  matchRows = [
    { label: 'Class', value: 'A Levels' },
    { label: 'Subject', value: 'Mathematics & Physics' },
    { label: 'City', value: 'Lahore' },
    { label: 'Budget', value: 'PKR 15,000 - 20,000 / month' },
    { label: 'Preferred gender', value: 'No preference' },
    { label: 'Mode', value: 'Online or Home' },
    { label: 'Learning goal', value: 'Target A* in May 2026' },
  ];
  trustCards = [
    { icon: 'shield-check', title: 'Verified profiles', body: 'ID, CNIC, education docs' },
    { icon: 'calendar', title: 'Demo class before paying', body: 'Try first. Decide later.' },
    { icon: 'wallet', title: 'Transparent pricing', body: 'No haggling, no surprises' },
    { icon: 'star', title: 'Real parent reviews', body: 'Anonymous, moderated' },
    { icon: 'message-circle', title: 'Secure chat', body: 'All conversations on Mentora' },
    { icon: 'shield-check', title: 'Identity verification', body: 'CNIC + selfie + reference' },
    { icon: 'trending-up', title: 'Rating system', body: 'Live performance scores' },
    { icon: 'clock', title: 'Response time tracking', body: 'We measure every reply' },
  ];
  steps = [
    { no: '01', title: 'Tell us what you need', body: 'Subject, class, city, budget - 30 seconds.' },
    { no: '02', title: 'Get AI-matched tutors', body: 'Top 3 verified tutors, ranked by fit and results.' },
    { no: '03', title: 'Book a demo class', body: 'Try a free 30-min session. Pay only when convinced.' },
  ];
  stories = [
    { name: 'Asma Tariq', role: 'Parent of A Level student', city: 'Lahore', quote: "We tried 4 tutors before Mentora. The AI match nailed it on the first try. Bilal has been a blessing for my son's physics." },
    { name: 'Hassan, 17', role: 'A Level Student', city: 'Karachi', quote: 'The demo class let me actually test the tutor before paying. Sir Hamza explained chemistry in 20 minutes better than 2 years at my academy.' },
    { name: 'Ayesha Malik', role: 'Verified Tutor', city: 'Lahore', quote: 'I went from juggling WhatsApp groups to a full schedule of serious students in 6 weeks. Mentora respects tutors.' },
  ];

  constructor(private readonly api: ApiService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.api.tutors().subscribe(tutors => {
      this.tutors = tutors;
      this.cdr.detectChanges();
    });
    this.api.lookups().subscribe(lookups => {
      this.cities = lookups['city'] ?? [];
      this.subjects = lookups['subject'] ?? [];
      this.cdr.detectChanges();
    });
  }
}
