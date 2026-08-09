/* SkillConnect React Native - AppContext State Manager */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserRole,
  User,
  ProviderProfile,
  Category,
  JobRequest,
  Bid,
  ChatMessage,
  KYCSubmission,
  DisputeCase,
  AdminAnalytics
} from '../types';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  
  categories: Category[];
  currentUser: User;
  currentProvider: ProviderProfile;
  providers: ProviderProfile[];
  jobs: JobRequest[];
  bids: Bid[];
  chats: Record<string, ChatMessage[]>;
  kycSubmissions: KYCSubmission[];
  disputes: DisputeCase[];
  analytics: AdminAnalytics;
  
  addJobRequest: (jobData: Partial<JobRequest>) => JobRequest;
  submitBid: (jobId: string, price: number, etaMinutes: number, message: string) => Bid;
  counterBid: (bidId: string, counterPrice: number) => void;
  acceptBid: (bidId: string) => void;
  updateJobStatus: (jobId: string, newStatus: JobRequest['status'], extraData?: any) => void;
  sendChatMessage: (jobId: string, text: string) => void;
  submitKYC: (kycData: Partial<KYCSubmission>) => void;
  approveKYC: (kycId: string) => void;
  resolveDispute: (disputeId: string, action: 'refund' | 'payout') => void;
  updateGuardrails: (catId: string, minBid: number, maxBid: number, commissionPct: number) => void;
  toggleProviderOnline: (isOnline: boolean) => void;
}

const STORAGE_KEY = '@skillconnect_react_native_state';

const defaultState = {
  role: 'customer' as UserRole,
  activeCategory: 'all',
  categories: [
    { id: 'electrician', name: 'Electrician', icon: 'zap', minBid: 25, maxBid: 400, commissionPct: 10 },
    { id: 'plumber', name: 'Plumber', icon: 'droplet', minBid: 30, maxBid: 450, commissionPct: 10 },
    { id: 'carpenter', name: 'Carpenter', icon: 'hammer', minBid: 35, maxBid: 600, commissionPct: 12 },
    { id: 'painter', name: 'Painter', icon: 'paint-bucket', minBid: 40, maxBid: 800, commissionPct: 10 },
    { id: 'ac_tech', name: 'AC Technician', icon: 'wind', minBid: 40, maxBid: 500, commissionPct: 10 },
    { id: 'mechanic', name: 'Mechanic', icon: 'wrench', minBid: 30, maxBid: 500, commissionPct: 10 }
  ],
  currentUser: {
    id: 'c_user_1',
    name: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    email: 'sarah.j@example.com',
    avatar: 'SJ',
    address: '742 Evergreen Terrace, Downtown'
  },
  currentProvider: {
    id: 'p_user_1',
    name: 'Alex Rivers',
    phone: '+1 (555) 876-5432',
    email: 'alex.r@example.com',
    category: 'electrician',
    rating: 4.9,
    jobCount: 142,
    isVerified: true,
    verificationStatus: 'approved' as const,
    isOnline: true,
    serviceRadiusKm: 15,
    lat: 37.7749,
    lng: -122.4194,
    responseRate: '98%',
    walletBalance: 420.50,
    earningsHistory: [
      { date: '2026-07-24', amount: 85.00, jobTitle: 'Ceiling Fan Installation' },
      { date: '2026-07-22', amount: 120.00, jobTitle: 'Rewiring Main Panel' }
    ]
  },
  providers: [
    {
      id: 'p_user_1',
      name: 'Alex Rivers',
      phone: '+1 (555) 876-5432',
      email: 'alex.r@example.com',
      category: 'electrician',
      rating: 4.9,
      jobCount: 142,
      isVerified: true,
      verificationStatus: 'approved' as const,
      isOnline: true,
      serviceRadiusKm: 15,
      lat: 37.7765,
      lng: -122.4180,
      responseRate: '98%',
      walletBalance: 420.50,
      earningsHistory: []
    },
    {
      id: 'p_user_2',
      name: 'David Chen',
      phone: '+1 (555) 334-9988',
      email: 'david.c@example.com',
      category: 'plumber',
      rating: 4.8,
      jobCount: 98,
      isVerified: true,
      verificationStatus: 'approved' as const,
      isOnline: true,
      serviceRadiusKm: 20,
      lat: 37.7720,
      lng: -122.4240,
      responseRate: '95%',
      walletBalance: 310.00,
      earningsHistory: []
    }
  ],
  jobs: [
    {
      id: 'job_101',
      customerId: 'c_user_1',
      customerName: 'Sarah Jenkins',
      title: 'Fix Kitchen Breaker & Install Smart Socket',
      category: 'electrician',
      description: 'Main kitchen circuit keeps tripping. Need breaker replacement and smart socket installation.',
      location: '742 Evergreen Terrace, Downtown',
      lat: 37.7749,
      lng: -122.4194,
      scheduleType: 'Now',
      budgetRange: '$50 - $90',
      status: 'open' as const,
      createdAt: new Date().toISOString(),
      acceptedBidId: null,
      providerId: null
    }
  ],
  bids: [
    {
      id: 'bid_1',
      jobId: 'job_101',
      providerId: 'p_user_1',
      providerName: 'Alex Rivers',
      providerRating: 4.9,
      providerJobCount: 142,
      isVerified: true,
      price: 65,
      etaMinutes: 20,
      message: 'Available immediately with full breaker testing kit.',
      status: 'pending' as const,
      counterPrice: null,
      updatedAt: new Date().toISOString()
    }
  ],
  chats: {
    'job_101': [
      { id: 'm1', sender: 'p_user_1', senderName: 'Alex Rivers', text: 'Hi Sarah! Ready to head over upon acceptance.', timestamp: '10:15 AM' }
    ]
  },
  kycSubmissions: [
    {
      id: 'kyc_201',
      providerId: 'p_user_5',
      name: 'Carlos Mendez',
      phone: '+1 (555) 998-1122',
      category: 'painter',
      experienceYears: 6,
      idDocument: 'PASSPORT_MEX_88.jpg',
      selfie: 'SELFIE_MATCH_99.jpg',
      status: 'pending' as const,
      submittedAt: '2026-07-25 14:30'
    }
  ],
  disputes: [
    {
      id: 'disp_301',
      jobId: 'job_090',
      jobTitle: 'Water Heater Flush',
      raisedBy: 'Customer (John Doe)',
      providerName: 'David Chen',
      amount: 110.00,
      reason: 'Provider arrived late and left without completing flush.',
      evidencePhoto: 'HEATER_PROOF.jpg',
      status: 'open' as const,
      createdAt: '2026-07-25'
    }
  ],
  analytics: {
    totalGmv: '$38,450',
    activeUsers: '1,280',
    completedJobs: '412',
    avgBidTimeSec: '4.2s',
    cancellationRate: '1.8%',
    commissionEarned: '$3,845'
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('customer');
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>(defaultState.categories);
  const [currentUser] = useState<User>(defaultState.currentUser);
  const [currentProvider, setCurrentProvider] = useState<ProviderProfile>(defaultState.currentProvider);
  const [providers, setProviders] = useState<ProviderProfile[]>(defaultState.providers);
  const [jobs, setJobs] = useState<JobRequest[]>(defaultState.jobs);
  const [bids, setBids] = useState<Bid[]>(defaultState.bids);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(defaultState.chats);
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>(defaultState.kycSubmissions);
  const [disputes, setDisputes] = useState<DisputeCase[]>(defaultState.disputes);
  const [analytics] = useState<AdminAnalytics>(defaultState.analytics);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.jobs) setJobs(parsed.jobs);
          if (parsed.bids) setBids(parsed.bids);
          if (parsed.chats) setChats(parsed.chats);
          if (parsed.kycSubmissions) setKycSubmissions(parsed.kycSubmissions);
        } catch (e) {
          console.log('Error loading storage', e);
        }
      }
    });
  }, []);

  const saveData = (newJobs: JobRequest[], newBids: Bid[], newChats: Record<string, ChatMessage[]>) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ jobs: newJobs, bids: newBids, chats: newChats }));
  };

  const addJobRequest = (jobData: Partial<JobRequest>): JobRequest => {
    const newJob: JobRequest = {
      id: 'job_' + Date.now(),
      customerId: currentUser.id,
      customerName: currentUser.name,
      title: jobData.title || 'New Repair Task',
      category: jobData.category || 'electrician',
      description: jobData.description || '',
      location: jobData.location || currentUser.address,
      lat: 37.7749,
      lng: -122.4194,
      scheduleType: jobData.scheduleType || 'Now',
      budgetRange: jobData.budgetRange || '$50 - $100',
      status: 'open',
      createdAt: new Date().toISOString(),
      acceptedBidId: null,
      providerId: null
    };

    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    saveData(updatedJobs, bids, chats);

    // Auto-generate realistic bid after 4 seconds
    setTimeout(() => {
      const autoBid: Bid = {
        id: 'bid_' + Date.now(),
        jobId: newJob.id,
        providerId: currentProvider.id,
        providerName: currentProvider.name,
        providerRating: currentProvider.rating,
        providerJobCount: currentProvider.jobCount,
        isVerified: true,
        price: 65,
        etaMinutes: 15,
        message: 'Hello! Nearby in area and ready to help.',
        status: 'pending',
        counterPrice: null,
        updatedAt: new Date().toISOString()
      };
      setBids(prev => [autoBid, ...prev]);
    }, 4000);

    return newJob;
  };

  const submitBid = (jobId: string, price: number, etaMinutes: number, message: string): Bid => {
    const newBid: Bid = {
      id: 'bid_' + Date.now(),
      jobId,
      providerId: currentProvider.id,
      providerName: currentProvider.name,
      providerRating: currentProvider.rating,
      providerJobCount: currentProvider.jobCount,
      isVerified: currentProvider.isVerified,
      price,
      etaMinutes,
      message,
      status: 'pending',
      counterPrice: null,
      updatedAt: new Date().toISOString()
    };
    const updatedBids = [newBid, ...bids];
    setBids(updatedBids);
    saveData(jobs, updatedBids, chats);
    return newBid;
  };

  const counterBid = (bidId: string, counterPrice: number) => {
    const updated = bids.map(b => b.id === bidId ? { ...b, status: 'countered' as const, counterPrice } : b);
    setBids(updated);
    saveData(jobs, updated, chats);
  };

  const acceptBid = (bidId: string) => {
    const targetBid = bids.find(b => b.id === bidId);
    if (!targetBid) return;

    const updatedBids = bids.map(b => {
      if (b.id === bidId) return { ...b, status: 'accepted' as const };
      if (b.jobId === targetBid.jobId) return { ...b, status: 'declined' as const };
      return b;
    });

    const updatedJobs = jobs.map(j => {
      if (j.id === targetBid.jobId) {
        return {
          ...j,
          status: 'accepted' as const,
          acceptedBidId: bidId,
          providerId: targetBid.providerId,
          finalPrice: targetBid.counterPrice || targetBid.price
        };
      }
      return j;
    });

    setBids(updatedBids);
    setJobs(updatedJobs);
    saveData(updatedJobs, updatedBids, chats);
  };

  const updateJobStatus = (jobId: string, newStatus: JobRequest['status'], extraData?: any) => {
    const updatedJobs = jobs.map(j => {
      if (j.id === jobId) {
        return { ...j, status: newStatus, ...extraData };
      }
      return j;
    });
    setJobs(updatedJobs);
    saveData(updatedJobs, bids, chats);
  };

  const sendChatMessage = (jobId: string, text: string) => {
    const isCust = role === 'customer';
    const sender = isCust ? currentUser.id : currentProvider.id;
    const senderName = isCust ? currentUser.name : currentProvider.name;

    const msg: ChatMessage = {
      id: 'm_' + Date.now(),
      sender,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = {
      ...chats,
      [jobId]: [...(chats[jobId] || []), msg]
    };

    setChats(updatedChats);
    saveData(jobs, bids, updatedChats);
  };

  const submitKYC = (kycData: Partial<KYCSubmission>) => {
    const newSub: KYCSubmission = {
      id: 'kyc_' + Date.now(),
      providerId: 'p_user_' + Date.now(),
      name: kycData.name || 'Provider',
      phone: kycData.phone || '',
      category: kycData.category || 'electrician',
      experienceYears: kycData.experienceYears || 3,
      idDocument: 'GOVT_ID.jpg',
      selfie: 'SELFIE_MATCH.jpg',
      status: 'pending',
      submittedAt: new Date().toLocaleString()
    };
    setKycSubmissions([newSub, ...kycSubmissions]);
  };

  const approveKYC = (kycId: string) => {
    setKycSubmissions(kycSubmissions.map(k => k.id === kycId ? { ...k, status: 'approved' as const } : k));
  };

  const resolveDispute = (disputeId: string, action: 'refund' | 'payout') => {
    setDisputes(disputes.map(d => d.id === disputeId ? { ...d, status: action === 'refund' ? 'refunded' : 'payout_released' } : d));
  };

  const updateGuardrails = (catId: string, minBid: number, maxBid: number, commissionPct: number) => {
    setCategories(categories.map(c => c.id === catId ? { ...c, minBid, maxBid, commissionPct } : c));
  };

  const toggleProviderOnline = (isOnline: boolean) => {
    setCurrentProvider({ ...currentProvider, isOnline });
  };

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      activeCategory,
      setActiveCategory,
      categories,
      currentUser,
      currentProvider,
      providers,
      jobs,
      bids,
      chats,
      kycSubmissions,
      disputes,
      analytics,
      addJobRequest,
      submitBid,
      counterBid,
      acceptBid,
      updateJobStatus,
      sendChatMessage,
      submitKYC,
      approveKYC,
      resolveDispute,
      updateGuardrails,
      toggleProviderOnline
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
