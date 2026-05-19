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
