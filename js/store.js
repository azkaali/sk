/* SkillConnect Store - Central Reactive State & Persistence */

class SkillConnectStore {
  constructor() {
    this.STORAGE_KEY = 'skillconnect_state_v1';
    this.listeners = [];
    this.initStore();
  }

  initStore() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state, using default:', e);
        this.state = this.getDefaultState();
      }
    } else {
      this.state = this.getDefaultState();
    }
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  getDefaultState() {
    return {
      currentRole: 'customer', // 'customer' | 'provider' | 'admin'
      deviceMode: 'desktop',   // 'desktop' | 'mobile'
      activeCategory: 'all',
      
      // Categories with Guardrails
      categories: [
        { id: 'electrician', name: 'Electrician', icon: 'fa-bolt', minBid: 25, maxBid: 400, commissionPct: 10 },
        { id: 'plumber', name: 'Plumber', icon: 'fa-faucet', minBid: 30, maxBid: 450, commissionPct: 10 },
        { id: 'carpenter', name: 'Carpenter', icon: 'fa-hammer', minBid: 35, maxBid: 600, commissionPct: 12 },
        { id: 'painter', name: 'Painter', icon: 'fa-paint-roller', minBid: 40, maxBid: 800, commissionPct: 10 },
        { id: 'ac_tech', name: 'AC Technician', icon: 'fa-snowflake', minBid: 40, maxBid: 500, commissionPct: 10 },
        { id: 'mechanic', name: 'Mechanic', icon: 'fa-wrench', minBid: 30, maxBid: 500, commissionPct: 10 },
        { id: 'cleaner', name: 'House Cleaner', icon: 'fa-broom', minBid: 20, maxBid: 250, commissionPct: 8 },
        { id: 'welder', name: 'Welder/Metal', icon: 'fa-fire-burner', minBid: 50, maxBid: 700, commissionPct: 12 }
      ],

      // Current active user identities
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
        verificationStatus: 'approved', // 'approved' | 'pending' | 'rejected'
        isOnline: true,
        serviceRadiusKm: 15,
        lat: 37.7749,
        lng: -122.4194,
        walletBalance: 420.50,
        earningsHistory: [
          { date: '2026-07-24', amount: 85.00, jobTitle: 'Ceiling Fan Installation' },
          { date: '2026-07-22', amount: 120.00, jobTitle: 'Rewiring Main Panel' }
        ]
      },

      // Nearby Seeded Providers
      providers: [
        {
          id: 'p_user_1',
          name: 'Alex Rivers',
          category: 'electrician',
          rating: 4.9,
          jobCount: 142,
          isVerified: true,
          isOnline: true,
          lat: 37.7765,
          lng: -122.4180,
          responseRate: '98%'
        },
        {
          id: 'p_user_2',
          name: 'David Chen',
          category: 'plumber',
          rating: 4.8,
          jobCount: 98,
          isVerified: true,
          isOnline: true,
          lat: 37.7720,
          lng: -122.4240,
          responseRate: '95%'
        },
        {
          id: 'p_user_3',
          name: 'Marcus Vance',
          category: 'carpenter',
          rating: 4.75,
          jobCount: 64,
          isVerified: true,
          isOnline: true,
          lat: 37.7780,
          lng: -122.4120,
          responseRate: '92%'
        },
        {
          id: 'p_user_4',
          name: 'Samira Khan',
          category: 'ac_tech',
          rating: 4.95,
          jobCount: 210,
          isVerified: true,
          isOnline: true,
          lat: 37.7710,
          lng: -122.4150,
          responseRate: '99%'
        }
      ],

      // Jobs (JobRequests)
      jobs: [
        {
          id: 'job_101',
          customerId: 'c_user_1',
          customerName: 'Sarah Jenkins',
          title: 'Fix Kitchen Breaker & Install Smart Socket',
          category: 'electrician',
          description: 'Main kitchen circuit keeps tripping when microwave and oven are on together. Need inspection and replacement of double-gang outlet with USB-C smart socket.',
          location: '742 Evergreen Terrace, Downtown',
          lat: 37.7749,
          lng: -122.4194,
          scheduleType: 'Now',
          budgetRange: '$50 - $90',
          status: 'open', // 'open' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'disputed'
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          acceptedBidId: null,
          providerId: null,
          beforePhoto: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=300',
          afterPhoto: null
        },
        {
          id: 'job_102',
          customerId: 'c_user_2',
          customerName: 'Robert Vance',
          title: 'Bathroom Sink Drainage Leak',
          category: 'plumber',
          description: 'P-trap underneath master bathroom sink is dripping water into cabinet. Need quick replacement.',
          location: '120 Market St, Financial District',
          lat: 37.7790,
          lng: -122.4110,
          scheduleType: 'Scheduled',
          budgetRange: '$40 - $75',
          status: 'open',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          acceptedBidId: null,
          providerId: null,
          beforePhoto: null,
          afterPhoto: null
        }
      ],

      // Bids (InDrive-style negotiation)
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
          message: 'Can be there in 20 mins with standard breaker replacement kit.',
          status: 'pending', // 'pending' | 'countered' | 'accepted' | 'declined'
          counterPrice: null,
          updatedAt: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 'bid_2',
          jobId: 'job_101',
          providerId: 'p_user_3',
          providerName: 'Marcus Vance',
          providerRating: 4.75,
          providerJobCount: 64,
          isVerified: true,
          price: 55,
          etaMinutes: 35,
          message: 'Nearby in SoMa, available immediately after my current gig.',
          status: 'pending',
          counterPrice: null,
          updatedAt: new Date(Date.now() - 1200000).toISOString()
        }
      ],

      // Chat transcripts per job
      chats: {
        'job_101': [
          { id: 'm1', sender: 'p_user_1', senderName: 'Alex Rivers', text: 'Hi Sarah! I am ready to head over as soon as you confirm the bid.', timestamp: '10:15 AM' },
          { id: 'm2', sender: 'c_user_1', senderName: 'Sarah Jenkins', text: 'Sounds great Alex! Is the USB socket included in your price or separate?', timestamp: '10:17 AM' },
          { id: 'm3', sender: 'p_user_1', senderName: 'Alex Rivers', text: 'I carry standard dual USB-C modules for $15 extra, or I can install yours for free.', timestamp: '10:18 AM' }
        ]
      },

      // KYC Verification Submissions for Admin Queue
      kycSubmissions: [
        {
          id: 'kyc_201',
          providerId: 'p_user_5',
          name: 'Carlos Mendez',
          phone: '+1 (555) 998-1122',
          category: 'painter',
          experienceYears: 6,
          idDocument: 'ID_PASSPORT_88392.jpg',
          selfie: 'SELFIE_MATCH_99.jpg',
          status: 'pending',
          submittedAt: '2026-07-25 14:30'
        },
        {
          id: 'kyc_202',
          providerId: 'p_user_6',
          name: 'Elena Rostova',
          phone: '+1 (555) 443-8811',
          category: 'cleaner',
          experienceYears: 4,
          idDocument: 'DL_CA_994821.jpg',
          selfie: 'SELFIE_MATCH_10.jpg',
          status: 'pending',
          submittedAt: '2026-07-26 09:15'
        }
      ],

      // Disputes for Admin Desk
      disputes: [
        {
          id: 'disp_301',
          jobId: 'job_090',
          jobTitle: 'Water Heater Flush',
          raisedBy: 'Customer (John Doe)',
          providerName: 'David Chen',
          amount: 110.00,
          reason: 'Provider arrived 2 hours late and did not finish flushing tank fully.',
          evidencePhoto: 'HEATER_FLUSH_PROOF.jpg',
          status: 'open',
          createdAt: '2026-07-25'
        }
      ],

      // Admin Analytics Dashboard Stats
      adminAnalytics: {
        totalGmv: '$38,450',
        activeUsers: '1,280',
        completedJobs: '412',
        avgBidTimeSec: '4.2s',
        cancellationRate: '1.8%',
        commissionEarned: '$3,845'
      }
    };
  }

  // Action methods
  setRole(role) {
    this.state.currentRole = role;
    this.save();
  }

  setDeviceMode(mode) {
    this.state.deviceMode = mode;
    this.save();
  }

  setActiveCategory(cat) {
    this.state.activeCategory = cat;
    this.save();
  }

  // Job Posting
  addJobRequest(jobData) {
    const newJob = {
      id: 'job_' + Date.now(),
      customerId: this.state.currentUser.id,
      customerName: this.state.currentUser.name,
      status: 'open',
      createdAt: new Date().toISOString(),
      acceptedBidId: null,
      providerId: null,
      beforePhoto: jobData.photo || null,
      afterPhoto: null,
      ...jobData
    };
    this.state.jobs.unshift(newJob);
    this.save();
    return newJob;
  }

  // Bidding & Negotiation
  submitBid(jobId, price, etaMinutes, message) {
    // Check Guardrails
    const job = this.state.jobs.find(j => j.id === jobId);
    const catConfig = this.state.categories.find(c => c.id === job.category) || { minBid: 10, maxBid: 1000 };
    if (price < catConfig.minBid || price > catConfig.maxBid) {
      throw new Error(`Price must be between $${catConfig.minBid} and $${catConfig.maxBid} for ${catConfig.name}`);
    }

    const newBid = {
      id: 'bid_' + Date.now(),
      jobId,
      providerId: this.state.currentProvider.id,
      providerName: this.state.currentProvider.name,
      providerRating: this.state.currentProvider.rating,
      providerJobCount: this.state.currentProvider.jobCount,
      isVerified: this.state.currentProvider.isVerified,
      price: Number(price),
      etaMinutes: Number(etaMinutes),
      message,
      status: 'pending',
      counterPrice: null,
      updatedAt: new Date().toISOString()
    };
    this.state.bids.push(newBid);
    this.save();
    return newBid;
  }

  counterBid(bidId, counterPrice) {
    const bid = this.state.bids.find(b => b.id === bidId);
    if (bid) {
      bid.status = 'countered';
      bid.counterPrice = Number(counterPrice);
      bid.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  acceptBid(bidId) {
    const bid = this.state.bids.find(b => b.id === bidId);
    if (!bid) return;

    bid.status = 'accepted';
    const job = this.state.jobs.find(j => j.id === bid.jobId);
    if (job) {
      job.status = 'accepted';
      job.acceptedBidId = bid.id;
      job.providerId = bid.providerId;
      job.finalPrice = bid.counterPrice || bid.price;
    }

    // Expire other bids on this job
    this.state.bids.forEach(b => {
      if (b.jobId === bid.jobId && b.id !== bidId) {
        b.status = 'declined';
      }
    });

    this.save();
  }

  // Job Execution Status Progression
  updateJobStatus(jobId, newStatus, extraData = {}) {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (job) {
      job.status = newStatus;
      if (extraData.afterPhoto) job.afterPhoto = extraData.afterPhoto;
      if (newStatus === 'completed' && job.finalPrice) {
        // Record earnings for provider
        this.state.currentProvider.walletBalance += (job.finalPrice * 0.9); // 10% platform commission
        this.state.currentProvider.earningsHistory.unshift({
          date: new Date().toISOString().split('T')[0],
          amount: job.finalPrice * 0.9,
          jobTitle: job.title
        });
      }
      this.save();
    }
  }

  // Chat message send
  sendChatMessage(jobId, senderId, senderName, text) {
    if (!this.state.chats[jobId]) {
      this.state.chats[jobId] = [];
    }
    const msg = {
      id: 'm_' + Date.now(),
      sender: senderId,
      senderName: senderName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.state.chats[jobId].push(msg);
    this.save();
    return msg;
  }

  // KYC Provider submission
  submitKYC(kycData) {
    const newSub = {
      id: 'kyc_' + Date.now(),
      providerId: 'p_user_' + Date.now(),
      status: 'pending',
      submittedAt: new Date().toLocaleString(),
      ...kycData
    };
    this.state.kycSubmissions.unshift(newSub);
    this.save();
    return newSub;
  }

  approveKYC(kycId) {
    const kyc = this.state.kycSubmissions.find(k => k.id === kycId);
    if (kyc) {
      kyc.status = 'approved';
      // Add provider to active providers list
      this.state.providers.push({
        id: kyc.providerId,
        name: kyc.name,
        category: kyc.category,
        rating: 5.0,
        jobCount: 0,
        isVerified: true,
        isOnline: true,
        lat: 37.7750 + (Math.random() - 0.5) * 0.02,
        lng: -122.4190 + (Math.random() - 0.5) * 0.02,
        responseRate: '100%'
      });
      this.save();
    }
  }

  // Admin Dispute Resolution
  resolveDispute(disputeId, action) {
    const disp = this.state.disputes.find(d => d.id === disputeId);
    if (disp) {
      disp.status = action === 'refund' ? 'refunded' : 'payout_released';
      this.save();
    }
  }

  // Category Guardrail Update by Admin
  updateCategoryGuardrails(catId, minBid, maxBid, commissionPct) {
    const cat = this.state.categories.find(c => c.id === catId);
    if (cat) {
      cat.minBid = Number(minBid);
      cat.maxBid = Number(maxBid);
      cat.commissionPct = Number(commissionPct);
      this.save();
    }
  }

  toggleProviderOnline(isOnline) {
    this.state.currentProvider.isOnline = isOnline;
    this.save();
  }
}

// Global Singleton Export
window.store = new SkillConnectStore();
