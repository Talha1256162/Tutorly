import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/site-layout/site-layout.component').then(m => m.SiteLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/public/landing/landing.component').then(m => m.LandingComponent) },
      { path: 'tutors', loadComponent: () => import('./features/tutors/browse-tutors/browse-tutors.component').then(m => m.BrowseTutorsComponent) },
      { path: 'tutors/:id', loadComponent: () => import('./features/tutors/tutor-detail/tutor-detail.component').then(m => m.TutorDetailComponent) },
      { path: 'book/:id', loadComponent: () => import('./features/tutors/book-demo/book-demo.component').then(m => m.BookDemoComponent) },
      { path: 'dashboard', loadComponent: () => import('./features/students/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent), canActivate: [AuthGuard], data: { roles: ['student', 'parent', 'admin'] } },
      { path: 'saved-tutors', loadComponent: () => import('./features/students/saved-tutors/saved-tutors.component').then(m => m.SavedTutorsComponent), canActivate: [AuthGuard], data: { roles: ['student', 'parent', 'admin'] } },
      { path: 'my-bookings', loadComponent: () => import('./features/students/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent), canActivate: [AuthGuard], data: { roles: ['student', 'parent', 'admin'] } },
      { path: 'tutor-dashboard', loadComponent: () => import('./features/tutors-dashboard/tutor-dashboard/tutor-dashboard.component').then(m => m.TutorDashboardComponent), canActivate: [AuthGuard], data: { roles: ['tutor', 'admin'] } },
      { path: 'insight/diagnostic', loadComponent: () => import('./features/insight/diagnostic/insight-diagnostic.component').then(m => m.InsightDiagnosticComponent), canActivate: [AuthGuard], data: { roles: ['student', 'parent', 'admin'] } },
      { path: 'insight/report/:attemptId', loadComponent: () => import('./features/insight/report/insight-report.component').then(m => m.InsightReportComponent), canActivate: [AuthGuard], data: { roles: ['student', 'parent', 'admin'] } },
      { path: 'insight/matched-tutors/:reportId', loadComponent: () => import('./features/insight/matched-tutors/insight-matched-tutors.component').then(m => m.InsightMatchedTutorsComponent), canActivate: [AuthGuard], data: { roles: ['student', 'parent', 'admin'] } },
      { path: 'not-found', loadComponent: () => import('./features/public/not-found/not-found.component').then(m => m.NotFoundComponent) },
    ],
  },
  { path: 'messages', loadComponent: () => import('./features/messages/messages.component').then(m => m.MessagesComponent), canActivate: [AuthGuard], data: { roles: ['student', 'parent', 'tutor', 'admin'] } },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'role', loadComponent: () => import('./features/auth/role-selection/role-selection.component').then(m => m.RoleSelectionComponent) },
  { path: '**', redirectTo: 'not-found' },
];
