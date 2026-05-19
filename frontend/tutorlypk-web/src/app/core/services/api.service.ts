import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import {
  ApiResponse,
  BookingConfirmation,
  BookingOption,
  BookingRequest,
  BookingSummary,
  Conversation,
  LookupValue,
  StudentDashboard,
  TutorDashboard,
  TutorProfile,
  TutorSummary,
} from '../models/api.models';
import {
  bookingFor,
  mockBookings,
  mockConversations,
  mockLookups,
  mockStudentDashboard,
  mockTutorDashboard,
  mockTutors,
  profileFor,
} from './mock-data';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:5101/api';

  constructor(private readonly http: HttpClient) {}

  lookups(): Observable<Record<string, LookupValue[]>> {
    return this.get<Record<string, LookupValue[]>>('/lookups', mockLookups);
  }

  tutors(search = '', sort = 'top-rated'): Observable<TutorSummary[]> {
    const params = new HttpParams().set('search', search).set('sort', sort);
    return this.get<TutorSummary[]>('/tutors', mockTutors, params);
  }

  tutorProfile(id: string): Observable<TutorProfile> {
    return this.get<TutorProfile>(`/tutors/${id}`, profileFor(id));
  }

  bookingOptions(id: string): Observable<BookingOption> {
    return this.get<BookingOption>(`/tutors/${id}/booking-options`, bookingFor(id));
  }

  studentDashboard(): Observable<StudentDashboard> {
    return this.get<StudentDashboard>('/dashboard/student', mockStudentDashboard);
  }

  tutorDashboard(): Observable<TutorDashboard> {
    return this.get<TutorDashboard>('/dashboard/tutor', mockTutorDashboard);
  }

  conversations(): Observable<Conversation[]> {
    return this.get<Conversation[]>('/messages/conversations', mockConversations);
  }

  savedTutors(): Observable<TutorSummary[]> {
    return this.get<TutorSummary[]>('/saved-tutors', mockTutors.slice(0, 4));
  }

  myBookings(): Observable<BookingSummary[]> {
    return this.get<BookingSummary[]>('/bookings/mine', mockBookings);
  }

  createDemoBooking(request: BookingRequest): Observable<BookingConfirmation> {
    return this.http.post<ApiResponse<BookingConfirmation>>(`${this.baseUrl}/bookings/demo`, request).pipe(
      map(response => response.data),
    );
  }

  saveTutor(tutorId: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/saved-tutors/${tutorId}`, {}).pipe(
      map(response => response.data),
      catchError(() => of(null)),
    );
  }

  private get<T>(path: string, fallback: T, params?: HttpParams): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`, { params }).pipe(
      map(response => response.data ?? fallback),
      catchError(() => of(fallback)),
    );
  }
}
