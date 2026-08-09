/* SkillConnect React Native - Core Data Entities & Types */

export type UserRole = 'customer' | 'provider' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  address: string;
}

export interface ProviderProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  rating: number;
  jobCount: number;
  isVerified: boolean;
  verificationStatus: 'approved' | 'pending' | 'rejected';
  isOnline: boolean;
  serviceRadiusKm: number;
  lat: number;
  lng: number;
  responseRate: string;
  walletBalance: number;
  earningsHistory: { date: string; amount: number; jobTitle: string }[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  minBid: number;
  maxBid: number;
  commissionPct: number;
}

export type JobStatus = 
  | 'open'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'disputed';

export interface JobRequest {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  category: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  scheduleType: 'Now' | 'Scheduled' | string;
  budgetRange: string;
  status: JobStatus;
  createdAt: string;
  acceptedBidId: string | null;
  providerId: string | null;
  finalPrice?: number;
  beforePhoto?: string | null;
  afterPhoto?: string | null;
}

export type BidStatus = 'pending' | 'countered' | 'accepted' | 'declined';

export interface Bid {
  id: string;
  jobId: string;
  providerId: string;
  providerName: string;
  providerRating: number;
  providerJobCount: number;
  isVerified: boolean;
  price: number;
  etaMinutes: number;
  message: string;
  status: BidStatus;
  counterPrice: number | null;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface KYCSubmission {
  id: string;
  providerId: string;
  name: string;
  phone: string;
  category: string;
  experienceYears: number;
  idDocument: string;
  selfie: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface DisputeCase {
  id: string;
  jobId: string;
  jobTitle: string;
  raisedBy: string;
  providerName: string;
  amount: number;
  reason: string;
  evidencePhoto: string;
  status: 'open' | 'refunded' | 'payout_released';
  createdAt: string;
}

export interface AdminAnalytics {
  totalGmv: string;
  activeUsers: string;
  completedJobs: string;
  avgBidTimeSec: string;
  cancellationRate: string;
  commissionEarned: string;
}
