# Tutorly / Mentora UI Reference

Reference inspected: https://tutorlypk.lovable.app/

This document is the visual contract for the Angular implementation. The frontend must reproduce the Lovable UI, not reinterpret it.

## Captured Reference Screenshots

Screenshots are stored in `docs/reference/`:

- `lovable-home-desktop.png`
- `lovable-home-mobile.png`
- `lovable-tutors-desktop.png`
- `lovable-tutors-mobile.png`
- `lovable-profile-route-desktop.png`
- `lovable-booking-desktop.png`
- `lovable-login-desktop.png`
- `lovable-role-desktop.png`
- `lovable-register-student-desktop.png`
- `lovable-register-tutor-desktop.png`
- `lovable-student-dashboard-desktop.png`
- `lovable-tutor-dashboard-desktop.png`
- `lovable-messages-desktop.png`

## Brand and Layout Notes

- The visible brand name is `Mentora`.
- The visual style is a dark premium AI marketplace, built around glass panels, deep navy surfaces, cyan/violet gradients, and rounded card geometry.
- Desktop layout uses a centered max-width shell around 1280px.
- Main public pages use a fixed glass navbar, large vertical spacing, and a dark background with subtle radial aurora gradients.
- Mobile uses the same visual language with a fixed rounded bottom navigation and hidden desktop nav links.

## Color Palette

Primary colors are expressed in the reference CSS with OKLCH values:

- Page background: `oklch(16% .04 265)`
- Surface: `oklch(20% .045 265)`
- Elevated surface: `oklch(24% .05 265)`
- Card: `oklch(21% .045 265)`
- Foreground text: `oklch(97% .01 250)`
- Muted text: `oklch(72% .03 255)`
- Primary blue: `oklch(68% .2 250)`
- Violet: `oklch(65% .24 295)`
- Cyan: `oklch(80% .16 200)`
- Success green: `oklch(72% .18 155)`
- Warning yellow: `oklch(78% .16 75)`
- Border: `oklch(100% 0 0 / .09)`
- Input border/background: `oklch(100% 0 0 / .12)`

## Gradients

- Primary button gradient: `linear-gradient(135deg, oklch(68% .2 250), oklch(65% .24 295))`
- Text aurora gradient: `linear-gradient(120deg, oklch(68% .2 250), oklch(65% .24 295), oklch(80% .16 200))`
- Hero background:
  `radial-gradient(ellipse 80% 60% at 50% -10%, oklch(35% .18 270 / .55), transparent 60%),
  radial-gradient(ellipse 60% 50% at 90% 20%, oklch(55% .22 295 / .35), transparent 60%),
  radial-gradient(ellipse 50% 50% at 10% 80%, oklch(60% .18 200 / .25), transparent 60%)`

## Typography

- Body font: `Inter`, system fallback.
- Display font: `Plus Jakarta Sans`, `Inter`, system fallback.
- Headings use display font, heavy weights, and tight tracking.
- Hero headline desktop: approximately 72px, 1.02 line-height.
- Section headings: 36px to 48px desktop, centered on marketing sections.
- Body copy: 16px to 18px with muted color.
- Labels and badges: 10px to 12px uppercase, wider tracking.

## Radius, Shadows, and Glass

- Base radius: `1rem`.
- Navbar radius: 24px.
- Large cards: 24px to 32px.
- Buttons: 12px to 999px depending on shape.
- Glass panel: transparent white overlay with `blur(20px) saturate(180%)`.
- Strong glass panel: `rgba(12, 21, 42, .70)` with blur 24px.
- Glow shadow: `0 20px 60px -20px oklch(55% .22 270 / .55)`.
- Card shadow: `0 10px 40px -10px oklch(10% .04 265 / .5)`.

## Buttons

- Primary buttons use the blue-to-violet gradient, dark primary foreground, bold text, rounded 12px or pill shape, and glow shadow.
- Secondary buttons are dark glass with a faint white border.
- Card action buttons use small rounded pills: `View` as transparent bordered, `Book Demo` as gradient.
- Dashboard action buttons keep the same gradient and radius.

## Cards

- Tutor cards are glass cards with 24px radius, subtle border, shadow, and hover lift.
- Tutor cards include circular/rounded-square image, verified badge, rating row, subject chips, mode chip, match badge, fee, next slot, and two CTAs.
- Dashboard stat cards are large glass cards with icon, label, large numeric value, and small trend/status copy.
- Booking and form panels use large dark glass cards with 24px radius and generous padding.

## Page Inventory

### Homepage

Required section order:

1. Fixed glass navbar
2. Hero section with badge, three-line headline, search panel, mode toggle, CTA, secondary links, stats
3. Floating AI match and tutor cards on desktop
4. Problem section with three cards
5. AI matching section with form-style left card and top matches on right
6. Featured tutors grid
7. Parent trust section
8. Three-step how-it-works section
9. Dashboard preview section
10. City coverage pills
11. Subject categories grid
12. Testimonials
13. Final CTA card
14. Footer

### Browse Tutors

- Fixed navbar.
- Full-width search and sort glass bar.
- Left filter sidebar at desktop width.
- Three-column tutor card grid.
- Filter sidebar includes subject, class, city, budget range, mode, gender, languages.
- Mobile collapses into one-column content with bottom navigation.

### Tutor Profile

- The inspected `/tutors/ayesha-malik` route currently renders the browse tutors page content.
- Angular must provide a real profile page, but it must reuse the exact same design language: dark background, glass cards, gradient buttons, chips, rating row, verified badge, and sticky booking sidebar.

### Booking

- Header back link, large title with gradient tutor name, muted subtitle.
- Left column step cards:
  1. date selector
  2. time slot selector
  3. mode selector
  4. goal textarea
- Right sticky summary card with tutor photo, summary rows, free demo, primary confirm button.
- Safety/trust notes are in a separate glass card.

### Login

- Split-screen desktop layout.
- Left half is the aurora gradient testimonial panel with brand top-left, testimonial bottom-left, footer note.
- Right half is centered login form.
- Inputs are dark rounded pill fields.
- Primary sign-in button is full-width gradient.
- Google button is dark bordered.

### Register

- Centered glass form card.
- Brand centered above the card.
- Student role title: `Create student account`.
- Tutor role title: `Create tutor account`.
- Three-step progress row with active gradient circle.
- Inputs match login fields.
- Bottom actions are back link and gradient continue button.

### Student Dashboard

- Fixed navbar, hero welcome glass card, four stat cards.
- Two-column dashboard layout.
- Left: recommended tutors, progress bars.
- Right: upcoming demos, messages, recent activity.

### Tutor Dashboard

- Fixed navbar, hero card with profile strength progress.
- Four stat cards.
- Two-column layout with earnings, student requests, subject performance, availability, reviews, response rate.
- Avoid any generic admin-table look.

### Messages

- Full-height glass chat shell.
- Left column conversation list with search field and selected-row highlight.
- Right column chat header, message bubbles, typing indicator, bottom input bar, safety notice.
- User messages use gradient bubble; other messages use dark glass bubbles.

## Responsive Behavior

- Desktop: fixed top navbar, footer visible on content pages, multi-column grids.
- Mobile: desktop nav links are hidden; bottom nav appears with five rounded icon tabs.
- Hero floating tutor cards are hidden on mobile.
- Tutor grids collapse to one column; dashboard cards stack.
- Login split panel should become a single-column form with the testimonial panel hidden or reduced.

## Dynamic Data Contract

Angular must not hardcode business lists. The following are loaded from APIs:

- cities
- subjects
- class levels
- teaching modes
- tutor cards
- tutor profile data
- booking options
- student dashboard stats
- tutor dashboard stats
- messages
- booking statuses and other dropdowns

The API may seed these values for local development, but Angular components must consume them through services.
