import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { SiteLayoutComponent } from './layout/site-layout/site-layout.component';
import { LandingComponent } from './features/public/landing/landing.component';
import { BrowseTutorsComponent } from './features/tutors/browse-tutors/browse-tutors.component';
import { TutorDetailComponent } from './features/tutors/tutor-detail/tutor-detail.component';
import { BookDemoComponent } from './features/tutors/book-demo/book-demo.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { RoleSelectionComponent } from './features/auth/role-selection/role-selection.component';
import { StudentDashboardComponent } from './features/students/student-dashboard/student-dashboard.component';
import { SavedTutorsComponent } from './features/students/saved-tutors/saved-tutors.component';
import { MyBookingsComponent } from './features/students/my-bookings/my-bookings.component';
import { TutorDashboardComponent } from './features/tutors-dashboard/tutor-dashboard/tutor-dashboard.component';
import { MessagesComponent } from './features/messages/messages.component';

export const routes: Routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    children: [
      { path: '', component: LandingComponent },
      { path: 'tutors', component: BrowseTutorsComponent },
      { path: 'tutors/:id', component: TutorDetailComponent },
      { path: 'book/:id', component: BookDemoComponent },
      { path: 'dashboard', component: StudentDashboardComponent, canActivate: [AuthGuard] },
      { path: 'saved-tutors', component: SavedTutorsComponent, canActivate: [AuthGuard] },
      { path: 'my-bookings', component: MyBookingsComponent, canActivate: [AuthGuard] },
      { path: 'tutor-dashboard', component: TutorDashboardComponent, canActivate: [AuthGuard] },
    ],
  },
  { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'role', component: RoleSelectionComponent },
  { path: '**', redirectTo: '' },
];
