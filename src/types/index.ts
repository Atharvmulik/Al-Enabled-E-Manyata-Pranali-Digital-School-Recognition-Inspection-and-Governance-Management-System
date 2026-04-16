export interface User {
  id: string;
  name: string;
  email: string;
  badgeNumber: string;
  department: string;
  phone: string;
  profileImage?: string;
  role: 'officer' | 'admin' | 'supervisor';
  isActive: boolean;
  lastLogin: string;
}

export interface School {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  principalName: string;
  schoolType: 'public' | 'private' | 'charter';
  totalStudents: number;
  establishedYear: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export type InspectionStatus =
  | 'pending'
  | 'assigned'
  | 'document_verification'
  | 'in_progress'
  | 'completed'
  | 'approved'
  | 'rejected'
  | 're_inspection_required';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface Inspection {
  id: string;
  schoolId: string;
  school: School;
  officerId: string;
  status: InspectionStatus;
  priority: PriorityLevel;
  assignedDate: string;
  completedDate?: string;
  dueDate: string;
  documents: Document[];
  evidence: Evidence[];
  finalReport?: FinalReport;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'registration' | 'license' | 'insurance' | 'safety_certificate' | 'staff_qualification' | 'other';
export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'needs_clarification';

export interface Document {
  id: string;
  inspectionId: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  fileType: 'pdf' | 'image';
  status: DocumentStatus;
  uploadedBy: string;
  uploadedAt: string;
  verifiedAt?: string;
  remarks?: string;
  size: number;
}


export type EvidenceType = 'photo' | 'video';
export type EvidenceTag = 'classroom' | 'lab' | 'safety' | 'infrastructure' | 'staff' | 'sanitation' | 'other';

export interface Evidence {
  id: string;
  inspectionId: string;
  type: EvidenceType;
  url: string;
  thumbnailUrl?: string;
  tag: EvidenceTag;
  description?: string;
  capturedAt: string;
  capturedBy: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  fileSize: number;
  isUploaded: boolean;
  uploadProgress?: number;
}

export type RiskCategory = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationType = 'approve' | 'reject' | 're_inspection';

export interface FinalReport {
  id: string;
  inspectionId: string;
  overallScore: number;
  riskCategory: RiskCategory;
  recommendation: RecommendationType;
  summary: string;
  weaknesses: string[];
  submittedAt: string;
  submittedBy: string;
}

export type NotificationType = 'assignment' | 'reminder' | 'alert' | 'update' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
  readAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  refreshToken: string | null;
  sessionExpiry: string | null;
}

export interface InspectionState {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: InspectionStatus;
    priority?: PriorityLevel;
    searchQuery?: string;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

export interface AppState {
  isOnline: boolean;
  isDarkMode: boolean;
  isBiometricEnabled: boolean;
  lastSyncTime: string | null;
  pendingSync: boolean;
}
