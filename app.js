/* SkillConnect - Core Application Orchestrator */

class SkillConnectApp {
  constructor() {
    this.init();
  }

  init() {
    // Subscribe to store state changes
    window.store.subscribe((state) => {
      this.renderCurrentView(state);
    });

    // Initialize initial render
    document.addEventListener('DOMContentLoaded', () => {
      window.appMap.initMap();
      this.renderCurrentView(window.store.state);
      this.setupFormListeners();
    });
  }

  setRole(role) {
    window.store.setRole(role);
  }

  toggleDeviceMode() {
    const current = window.store.state.deviceMode;
    const next = current === 'desktop' ? 'mobile' : 'desktop';
    window.store.setDeviceMode(next);
  }

  renderCurrentView(state) {
    // Update role button UI active state
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.role === state.currentRole) {
        btn.classList.add('active');
      }
    });

    // Update Device Mode wrapper class
    const wrapper = document.getElementById('deviceWrapper');
    if (wrapper) {
      if (state.deviceMode === 'mobile') {
        wrapper.classList.add('mobile-mode');
        document.getElementById('deviceToggleBtn').innerHTML = `<i class="fa-solid fa-desktop"></i> Desktop View`;
      } else {
        wrapper.classList.remove('mobile-mode');
        document.getElementById('deviceToggleBtn').innerHTML = `<i class="fa-solid fa-mobile-screen-button"></i> Mobile View`;
      }
    }

    // Hide all view sections, show active section
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    
    const activeSectionId = `${state.currentRole}ViewSection`;
    const activeSection = document.getElementById(activeSectionId);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // Render specific components based on role
    if (state.currentRole === 'customer') {
      window.customerView.renderCategories('customerCategoryBar', state.activeCategory);
      window.customerView.renderActiveJobCard('customerActiveJobContainer');
      window.customerView.renderBidsList('customerBidsContainer');
      
      // Update Map Markers
      window.appMap.renderProviders(state.providers, state.activeCategory);
      window.appMap.renderOpenJobs(state.jobs);
    } 
    else if (state.currentRole === 'provider') {
      window.providerView.renderProviderHeader('providerHeaderContainer');
      window.providerView.renderJobBroadcastFeed('providerJobFeedContainer');
      window.providerView.renderActiveProviderJob('providerActiveJobContainer');
      window.providerView.renderWallet('providerWalletContainer');

      // Update Map Markers
      window.appMap.renderProviders(state.providers, state.activeCategory);
      window.appMap.renderOpenJobs(state.jobs);
    } 
    else if (state.currentRole === 'admin') {
      window.adminView.renderAnalytics('adminAnalyticsContainer');
      window.adminView.renderKycQueue('adminKycContainer');
      window.adminView.renderGuardrails('adminGuardrailsContainer');
      window.adminView.renderDisputes('adminDisputesContainer');
    }
  }

  setupFormListeners() {
    // Job Post Form Submit
    const jobForm = document.getElementById('createJobForm');
    if (jobForm) {
      jobForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('jobTitleInput').value;
        const category = document.getElementById('jobCategorySelect').value;
        const description = document.getElementById('jobDescriptionInput').value;
        const budgetRange = document.getElementById('jobBudgetInput').value || '$50 - $100';
        const scheduleType = document.getElementById('jobScheduleSelect').value;

        const newJob = window.store.addJobRequest({
          title,
          category,
          description,
          budgetRange,
          scheduleType,
          location: '742 Evergreen Terrace, Downtown',
          lat: 37.7749 + (Math.random() - 0.5) * 0.01,
          lng: -122.4194 + (Math.random() - 0.5) * 0.01
        });

        this.hideModal('createJobModal');
        jobForm.reset();
        this.showToast('Job Request Posted! Nearby verified providers notified.');

        // Simulate auto-bidding from nearby providers after 4 seconds
        setTimeout(() => {
          window.store.submitBid(newJob.id, 65, 15, 'Hello! I am ready to come inspect and fix this right away.');
          this.showToast(`New Bid Received on "${newJob.title}"!`);
        }, 4000);
      });
    }

    // KYC Verification Submit Form
    const kycForm = document.getElementById('kycSubmitForm');
    if (kycForm) {
      kycForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('kycNameInput').value;
        const phone = document.getElementById('kycPhoneInput').value;
        const category = document.getElementById('kycCategorySelect').value;
        const experienceYears = document.getElementById('kycExpInput').value;

        window.store.submitKYC({
          name,
          phone,
          category,
          experienceYears,
          idDocument: 'GOVT_ID_DOC_VERIFIED.pdf',
          selfie: 'LIVE_SELFIE_MATCH.jpg'
        });

        this.hideModal('kycModal');
        kycForm.reset();
        this.showToast('KYC Verification Submitted! Pending Admin Approval.');
      });
    }
  }

  showModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  }

  hideModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  }

  openChat(jobId) {
    window.chatComp.openChatModal(jobId);
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-bell" style="color:var(--primary);"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }
}

window.app = new SkillConnectApp();
