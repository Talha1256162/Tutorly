export interface ApiResponse<T> {
  httpStatusCode: number;
  success: boolean;
  message: string;
  count: number;
  data: T;
  error: unknown;
}

export interface AuthUser {
  userId: string;
  fullName: string;
  emailOrPhone: string;
  role: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  user: AuthUser;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface GoogleLoginRequest {
  credential: string;
  role?: string;
}

export interface GoogleAuthConfig {
  enabled: boolean;
  clientId?: string | null;
}

export interface RegisterRequest {
  role: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  city?: string;
  subjects: string[];
  classLevels: string[];
  preferredModes: string[];
}

export interface LookupValue {
  id: number;
  groupCode: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface TutorSummary {
  id: string;
  name: string;
  photoUrl: string;
  initials: string;
  verified: boolean;
  rating: number;
  reviews: number;
  city: string;
  subjects: string[];
  classLevels: string[];
  experienceYears: number;
  feeText: string;
  feeAmount: number;
  teachingMode: string;
  languages: string[];
  nextSlot: string;
  gender: string;
  responseTime: string;
  studentsTaught: number;
  matchPercentage?: number;
  matchReason?: string;
  tagline: string;
}

export interface TutorSearchFilters {
  search?: string;
  sort?: string;
  subjects?: string[];
  classLevels?: string[];
  cities?: string[];
  modes?: string[];
  genders?: string[];
  languages?: string[];
  minFee?: number | null;
  maxFee?: number | null;
}

export interface TutorProfile {
  summary: TutorSummary;
  about: string;
  teachingStyle: string;
  education: string[];
  achievements: string[];
  availability: string[];
  reviews: ReviewSummary[];
}

export interface ReviewSummary {
  reviewerName: string;
  context: string;
  rating: number;
  quote: string;
  createdAt: string;
}

export interface BookingOption {
  tutorId: string;
  tutorName: string;
  tutorPhotoUrl: string;
  subjects: string[];
  dates: DateOption[];
  timeSlots: string[];
  modes: string[];
  safetyNotes: string[];
}

export interface DateOption {
  label: string;
  day: number;
  isoDate: string;
}

export interface BookingSummary {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorPhotoUrl: string;
  subjects: string[];
  bookingDate: string;
  bookingTime: string;
  teachingMode: string;
  status: string;
  learningGoal: string;
  createdAtUtc: string;
}

export interface BookingRequest {
  tutorId: string;
  selectedDate: string;
  selectedTime: string;
  mode: string;
  studentName: string;
  parentPhone: string;
  learningGoal: string;
}

export interface BookingConfirmation {
  bookingId: string;
  status: string;
  message: string;
}

export interface StatCard {
  label: string;
  value: string;
  caption: string;
  icon: string;
  tone?: string;
}

export interface StudentDashboard {
  welcomeName: string;
  headline: string;
  subheadline: string;
  stats: StatCard[];
  recommendedTutors: TutorSummary[];
  progress: ProgressMetric[];
  upcomingDemos: UpcomingDemo[];
  messages: MessagePreview[];
  recentActivity: ActivityItem[];
}

export interface TutorDashboard {
  tutorName: string;
  headline: string;
  subheadline: string;
  profileStrength: number;
  stats: StatCard[];
  earnings: EarningsMetric;
  studentRequests: StudentRequest[];
  subjectPerformance: SubjectPerformance[];
  availability: AvailabilityDay[];
  recentReviews: ReviewSummary[];
  responseRate: ResponseRate;
}

export interface ProgressMetric { label: string; percentage: number; }
export interface UpcomingDemo { tutorName: string; tutorPhotoUrl: string; subject: string; startsAt: string; actionLabel: string; }
export interface MessagePreview { personName: string; photoUrl: string; preview: string; time: string; }
export interface ActivityItem { text: string; timeAgo: string; tone: string; }
export interface EarningsMetric { labels: string[]; values: number[]; totalText: string; }
export interface StudentRequest { initial: string; studentName: string; detail: string; receivedAt: string; }
export interface SubjectPerformance { subject: string; rating: number; retentionPercentage: number; }
export interface AvailabilityDay { day: string; slots: boolean[]; }
export interface ResponseRate { percentage: number; averageReply: string; rank: string; delta: string; }

export interface Conversation {
  id: string;
  personName: string;
  photoUrl: string;
  verified: boolean;
  status: string;
  lastMessage: string;
  lastMessageTime: string;
  messages: MessageItem[];
}

export interface MessageItem {
  id: string;
  sender: string;
  body: string;
  time: string;
  isMine: boolean;
}

export interface InsightChildProfile {
  childId: string;
  childName: string;
  currentClass: number;
  city: string;
  area?: string | null;
  preferredLearningMode: string;
  boardCode?: string | null;
}

export interface InsightDiagnosticSetup {
  children: InsightChildProfile[];
  classes: number[];
  subjects: string[];
  topics: InsightTopicGroup[];
  questionCount: number;
}

export interface InsightTopicGroup {
  subjectCode: string;
  subjectName: string;
  topics: string[];
}

export interface StartInsightDiagnosticAttemptRequest {
  childId: string;
  currentClass: number;
  subjects: string[];
}

export interface StartInsightDiagnosticAttemptResponse {
  attemptId: string;
  status: string;
  questionCount: number;
  questions: InsightDiagnosticQuestion[];
}

export interface InsightDiagnosticQuestion {
  id: string;
  subjectCode: string;
  subjectName: string;
  classLevel: number;
  topicCode: string;
  topicName: string;
  difficulty: string;
  questionText: string;
  marks: number;
  options: InsightDiagnosticOption[];
}

export interface InsightDiagnosticOption {
  id: string;
  optionCode: string;
  optionText: string;
}

export interface SubmitInsightAnswerResponse {
  attemptId: string;
  questionId: string;
  isCorrect: boolean;
  marksAwarded: number;
}

export interface CompleteInsightAttemptResponse {
  attemptId: string;
  reportId: string;
  report: InsightLearningGapReport;
}

export interface InsightLearningGapReport {
  reportId: string;
  childId: string;
  diagnosticAttemptId: string;
  childName: string;
  currentClass: number;
  estimatedActualLevel: number;
  overallLearningScore: number;
  subjectScores: InsightSubjectScore[];
  weakTopics: InsightTopicScore[];
  strongTopics: InsightTopicScore[];
  recommendedTutorType: string;
  thirtyDayPlan: string;
  parentExplanation: string;
  createdAtUtc: string;
}

export interface InsightSubjectScore {
  subjectCode: string;
  subjectName: string;
  score: number;
  estimatedLevel: number;
}

export interface InsightTopicScore {
  subjectCode: string;
  topicCode: string;
  topicName: string;
  strengthCode: string;
  score: number;
}

export interface InsightMatchedTutorCard {
  tutorId: string;
  name: string;
  photoUrl: string;
  initials: string;
  subjects: string[];
  city: string;
  area?: string | null;
  experienceYears: number;
  verified: boolean;
  isCnicVerified: boolean;
  isQualificationVerified: boolean;
  tutorQualityScore: number;
  averageStudentImprovementPercent?: number | null;
  complaintRate?: number | null;
  bestForClassRange: string;
  trialClassAvailable: boolean;
  estimatedFee?: string | null;
  matchScore: number;
  matchReason: string;
}

export interface InsightDashboardSummary {
  selectedChild?: InsightChildProfile | null;
  latestReportId?: string | null;
  latestAttemptId?: string | null;
  latestLearningScore?: number | null;
  actualLevel?: number | null;
  currentClass?: number | null;
  weakSubjects: string[];
  insightMessage: string;
  nextActionLabel: string;
}

export interface InsightProgressReport {
  id: string;
  childId: string;
  childName: string;
  tutorName: string;
  reportMonth: string;
  beforeScore: number;
  afterScore: number;
  subjects: InsightProgressSubject[];
  completedTopics: string[];
  stillWeakTopics: string[];
  tutorAttendanceCount: number;
  parentFeedback?: string | null;
  recommendation: string;
}

export interface InsightProgressSubject {
  subjectCode: string;
  subjectName: string;
  beforeScore: number;
  afterScore: number;
  improvementPercent: number;
}

export interface TutorInsightSummary {
  qualityScore: number;
  feedbackScore?: number | null;
  assignedInsightStudents: number;
  progressReportsPending: number;
  improvementTips: string[];
}

export interface AdminInsightSummary {
  totalDiagnosticAttempts: number;
  reportsGenerated: number;
  tutorsNeedingVerification: number;
  progressReportsPending: number;
  lowQualityTutors: number;
}
