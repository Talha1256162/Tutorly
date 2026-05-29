import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import {
  ApiResponse,
  BookingConfirmation,
  BookingOption,
  BookingRequest,
  BookingSummary,
  AdminInsightSummary,
  Conversation,
  CompleteInsightAttemptResponse,
  InsightDashboardSummary,
  InsightDiagnosticSetup,
  InsightLearningGapReport,
  InsightMatchedTutorCard,
  InsightProgressReport,
  LookupValue,
  MessageItem,
  StartInsightDiagnosticAttemptRequest,
  StartInsightDiagnosticAttemptResponse,
  StudentDashboard,
  SubmitInsightAnswerResponse,
  TutorDashboard,
  TutorInsightSummary,
  TutorProfile,
  TutorSearchFilters,
  TutorSummary,
} from '../models/api.models';
import {
  bookingFor,
  mockBookings,
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

  tutors(query: TutorSearchFilters = {}): Observable<TutorSummary[]> {
    const normalizedQuery = { sort: 'top-rated', ...query };
    const params = this.toTutorParams(normalizedQuery);
    return this.get<TutorSummary[]>('/tutors', this.filterMockTutors(normalizedQuery), params);
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
    return this.http.get<ApiResponse<Conversation[]>>(`${this.baseUrl}/messages/conversations`).pipe(
      map(response => response.data ?? []),
    );
  }

  startConversation(tutorId: string): Observable<Conversation> {
    return this.http.post<ApiResponse<Conversation>>(`${this.baseUrl}/messages/with-tutor/${encodeURIComponent(tutorId)}`, {}).pipe(
      map(response => response.data),
    );
  }

  sendMessage(conversationId: string, body: string): Observable<MessageItem> {
    return this.http.post<ApiResponse<MessageItem>>(`${this.baseUrl}/messages/conversations/${conversationId}/messages`, { body }).pipe(
      map(response => response.data),
    );
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

  insightSetup(classLevel = 5, subject?: string): Observable<InsightDiagnosticSetup> {
    let params = new HttpParams().set('classLevel', String(classLevel));
    if (subject) {
      params = params.set('subject', subject);
    }

    return this.get<InsightDiagnosticSetup>('/insight/setup', this.defaultInsightSetup(), params);
  }

  startInsightDiagnostic(request: StartInsightDiagnosticAttemptRequest): Observable<StartInsightDiagnosticAttemptResponse> {
    return this.http.post<ApiResponse<StartInsightDiagnosticAttemptResponse>>(`${this.baseUrl}/insight/diagnostic-attempts`, request).pipe(
      map(response => response.data),
    );
  }

  insightAttemptQuestions(attemptId: string): Observable<StartInsightDiagnosticAttemptResponse['questions']> {
    return this.http.get<ApiResponse<StartInsightDiagnosticAttemptResponse['questions']>>(`${this.baseUrl}/insight/diagnostic-attempts/${attemptId}/questions`).pipe(
      map(response => response.data ?? []),
    );
  }

  submitInsightAnswer(attemptId: string, questionId: string, selectedOptionCode: string): Observable<SubmitInsightAnswerResponse> {
    return this.http.post<ApiResponse<SubmitInsightAnswerResponse>>(`${this.baseUrl}/insight/diagnostic-attempts/${attemptId}/answers`, {
      questionId,
      selectedOptionCode,
    }).pipe(map(response => response.data));
  }

  completeInsightAttempt(attemptId: string): Observable<CompleteInsightAttemptResponse> {
    return this.http.post<ApiResponse<CompleteInsightAttemptResponse>>(`${this.baseUrl}/insight/diagnostic-attempts/${attemptId}/complete`, {}).pipe(
      map(response => response.data),
    );
  }

  insightReport(reportId: string): Observable<InsightLearningGapReport> {
    return this.http.get<ApiResponse<InsightLearningGapReport>>(`${this.baseUrl}/insight/reports/${reportId}`).pipe(
      map(response => response.data),
    );
  }

  insightReportByAttempt(attemptId: string): Observable<InsightLearningGapReport> {
    return this.http.get<ApiResponse<InsightLearningGapReport>>(`${this.baseUrl}/insight/reports/by-attempt/${attemptId}`).pipe(
      map(response => response.data),
    );
  }

  insightMatchedTutors(reportId: string): Observable<InsightMatchedTutorCard[]> {
    return this.http.get<ApiResponse<InsightMatchedTutorCard[]>>(`${this.baseUrl}/insight/reports/${reportId}/matched-tutors`).pipe(
      map(response => response.data ?? []),
    );
  }

  insightDashboardSummary(): Observable<InsightDashboardSummary> {
    return this.get<InsightDashboardSummary>('/insight/dashboard-summary', {
      selectedChild: null,
      latestReportId: null,
      latestAttemptId: null,
      latestLearningScore: null,
      actualLevel: null,
      currentClass: null,
      weakSubjects: [],
      insightMessage: 'Start Tutorly Insight to understand the real learning level.',
      nextActionLabel: 'Start Diagnostic Test',
    });
  }

  insightProgressReports(): Observable<InsightProgressReport[]> {
    return this.get<InsightProgressReport[]>('/insight/progress', []);
  }

  tutorInsightSummary(): Observable<TutorInsightSummary> {
    return this.get<TutorInsightSummary>('/insight/tutor-summary', {
      qualityScore: 0,
      feedbackScore: null,
      assignedInsightStudents: 0,
      progressReportsPending: 0,
      improvementTips: [],
    });
  }

  adminInsightSummary(): Observable<AdminInsightSummary> {
    return this.get<AdminInsightSummary>('/insight/admin-summary', {
      totalDiagnosticAttempts: 0,
      reportsGenerated: 0,
      tutorsNeedingVerification: 0,
      progressReportsPending: 0,
      lowQualityTutors: 0,
    });
  }

  private get<T>(path: string, fallback: T, params?: HttpParams): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`, { params }).pipe(
      map(response => response.data ?? fallback),
      catchError(() => of(fallback)),
    );
  }

  private toTutorParams(query: TutorSearchFilters): HttpParams {
    let params = new HttpParams();

    params = this.appendTextParam(params, 'search', query.search);
    params = this.appendTextParam(params, 'sort', query.sort);
    params = this.appendListParam(params, 'subjects', query.subjects);
    params = this.appendListParam(params, 'classLevels', query.classLevels);
    params = this.appendListParam(params, 'cities', query.cities);
    params = this.appendListParam(params, 'modes', query.modes);
    params = this.appendListParam(params, 'genders', query.genders);
    params = this.appendListParam(params, 'languages', query.languages);

    if (query.minFee != null) {
      params = params.set('minFee', String(query.minFee));
    }

    if (query.maxFee != null) {
      params = params.set('maxFee', String(query.maxFee));
    }

    return params;
  }

  private appendTextParam(params: HttpParams, key: string, value?: string | null): HttpParams {
    const trimmed = value?.trim();
    return trimmed ? params.set(key, trimmed) : params;
  }

  private appendListParam(params: HttpParams, key: string, values?: string[]): HttpParams {
    return (values ?? [])
      .filter(value => value.trim().length > 0)
      .reduce((next, value) => next.append(key, value), params);
  }

  private filterMockTutors(query: TutorSearchFilters): TutorSummary[] {
    const search = this.normalize(query.search);
    const subjects = this.normalizeList(query.subjects);
    const classLevels = this.normalizeList(query.classLevels);
    const cities = this.normalizeList(query.cities);
    const modes = this.normalizeList(query.modes);
    const genders = this.normalizeList(query.genders);
    const languages = this.normalizeList(query.languages);

    const filtered = mockTutors.filter(tutor => {
      const searchable = [
        tutor.name,
        tutor.tagline,
        tutor.city,
        tutor.teachingMode,
        tutor.gender,
        tutor.matchReason ?? '',
        ...tutor.subjects,
        ...tutor.classLevels,
        ...tutor.languages,
      ].map(value => this.normalize(value));

      return (!search || searchable.some(value => value.includes(search)))
        && this.matchesList(subjects, tutor.subjects)
        && this.matchesList(classLevels, tutor.classLevels)
        && this.matchesList(cities, [tutor.city])
        && this.matchesList(modes, [tutor.teachingMode])
        && this.matchesList(genders, [tutor.gender])
        && this.matchesList(languages, tutor.languages)
        && (query.minFee == null || tutor.feeAmount >= query.minFee)
        && (query.maxFee == null || tutor.feeAmount <= query.maxFee);
    });

    return this.sortTutors(filtered, query.sort);
  }

  private sortTutors(tutors: TutorSummary[], sort = 'top-rated'): TutorSummary[] {
    const result = [...tutors];

    switch (sort) {
      case 'price-low':
        return result.sort((left, right) => left.feeAmount - right.feeAmount);
      case 'price-high':
        return result.sort((left, right) => right.feeAmount - left.feeAmount);
      case 'experience':
        return result.sort((left, right) => right.experienceYears - left.experienceYears);
      case 'reviews':
        return result.sort((left, right) => right.reviews - left.reviews);
      default:
        return result.sort((left, right) =>
          (right.matchPercentage ?? 0) - (left.matchPercentage ?? 0)
          || right.rating - left.rating
          || right.reviews - left.reviews);
    }
  }

  private matchesList(selected: string[], values: string[]): boolean {
    if (selected.length === 0) {
      return true;
    }

    const normalizedValues = values.map(value => this.normalize(value));
    return selected.some(item =>
      normalizedValues.some(value => value === item || value.includes(item) || item.includes(value)));
  }

  private normalizeList(values?: string[]): string[] {
    return (values ?? []).map(value => this.normalize(value)).filter(Boolean);
  }

  private normalize(value?: string | null): string {
    return (value ?? '').trim().toLowerCase();
  }

  private defaultInsightSetup(): InsightDiagnosticSetup {
    return {
      children: [
        {
          childId: 'demo-child',
          childName: 'Hamza',
          currentClass: 5,
          city: 'Karachi',
          area: 'Gulshan-e-Iqbal',
          preferredLearningMode: 'both',
          boardCode: 'matric',
        },
      ],
      classes: [1, 2, 3, 4, 5, 6, 7, 8],
      subjects: ['math', 'english', 'urdu'],
      topics: [
        { subjectCode: 'math', subjectName: 'Math', topics: ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'word problems'] },
        { subjectCode: 'english', subjectName: 'English', topics: ['reading comprehension', 'grammar', 'vocabulary', 'sentence structure'] },
        { subjectCode: 'urdu', subjectName: 'Urdu', topics: ['reading', 'comprehension', 'grammar', 'vocabulary'] },
      ],
      questionCount: 0,
    };
  }
}
