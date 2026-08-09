/* SkillConnect - Customer View Component */

class CustomerView {
  constructor() {
    this.selectedBidForCounter = null;
  }

  renderCategories(containerId, activeCategory) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const cats = window.store.state.categories;
    let html = `<div class="category-chip ${activeCategory === 'all' ? 'active' : ''}" onclick="window.store.setActiveCategory('all')">
      <i class="fa-solid fa-layer-group"></i> All Trades
    </div>`;

    cats.forEach(c => {
      html += `<div class="category-chip ${activeCategory === c.id ? 'active' : ''}" onclick="window.store.setActiveCategory('${c.id}')">
        <i class="fa-solid ${c.icon}"></i> ${c.name}
      </div>`;
    });

    el.innerHTML = html;
  }

  renderActiveJobCard(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const activeJob = window.store.state.jobs.find(j => 
      j.customerId === window.store.state.currentUser.id && j.status !== 'completed'
    );

    if (!activeJob) {
      el.innerHTML = `
        <div class="card" style="text-align:center; padding: 2rem 1rem;">
          <div style="font-size: 2.5rem; color: var(--primary); margin-bottom: 0.75rem;"><i class="fa-solid fa-hand-holding-hand"></i></div>
          <h3 style="margin-bottom: 0.4rem; font-weight:700;">Need Something Repaired or Built?</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">Post a job request and receive competing bids from verified local tradespeople in minutes.</p>
          <button class="btn btn-primary" onclick="app.showModal('createJobModal')">
            <i class="fa-solid fa-plus"></i> Post a Job Request
          </button>
        </div>
      `;
      return;
    }

    // Determine status steps for timeline
    const steps = ['accepted', 'en_route', 'arrived', 'in_progress'];
    const currentStepIndex = steps.indexOf(activeJob.status);

    let providerInfo = '';
    if (activeJob.providerId) {
      const prov = window.store.state.providers.find(p => p.id === activeJob.providerId) || { name: 'Assigned Provider', rating: 4.9 };
      providerInfo = `
        <div style="background:#0f172a; padding:10px; border-radius:8px; display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="avatar"><i class="fa-solid fa-user-gear"></i></div>
            <div>
              <h4 style="font-size:0.9rem; font-weight:700;">${prov.name}</h4>
              <span style="font-size:0.75rem; color:var(--accent-gold);"><i class="fa-solid fa-star"></i> ${prov.rating} Verified</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="app.openChat('${activeJob.id}')">
            <i class="fa-solid fa-comments"></i> Chat / Call
          </button>
        </div>
      `;
    }

    el.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <span class="status-pill ${activeJob.status}">${activeJob.status.replace('_', ' ')}</span>
            <h3 class="card-title" style="margin-top:6px;">${activeJob.title}</h3>
          </div>
          <span style="font-size:0.8rem; color:var(--text-muted);">${activeJob.scheduleType}</span>
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">${activeJob.description}</p>
        
        <!-- Execution Progress Timeline -->
        <div class="timeline">
          <div class="timeline-step ${currentStepIndex >= 0 ? 'active' : ''} ${currentStepIndex > 0 ? 'completed' : ''}">
            <div class="timeline-icon"><i class="fa-solid fa-check"></i></div>
            <span class="timeline-label">Accepted</span>
          </div>
          <div class="timeline-step ${currentStepIndex >= 1 ? 'active' : ''} ${currentStepIndex > 1 ? 'completed' : ''}">
            <div class="timeline-icon"><i class="fa-solid fa-location-dot"></i></div>
            <span class="timeline-label">En Route</span>
          </div>
          <div class="timeline-step ${currentStepIndex >= 2 ? 'active' : ''} ${currentStepIndex > 2 ? 'completed' : ''}">
            <div class="timeline-icon"><i class="fa-solid fa-door-open"></i></div>
            <span class="timeline-label">Arrived</span>
          </div>
          <div class="timeline-step ${currentStepIndex >= 3 ? 'active' : ''} ${currentStepIndex > 3 ? 'completed' : ''}">
            <div class="timeline-icon"><i class="fa-solid fa-screwdriver-wrench"></i></div>
            <span class="timeline-label">In Progress</span>
          </div>
        </div>

        ${providerInfo}

        <div style="display:flex; gap:8px; margin-top:12px;">
          ${activeJob.status === 'open' ? `<button class="btn btn-outline btn-sm" onclick="app.showModal('createJobModal')"><i class="fa-solid fa-pen"></i> Edit</button>` : ''}
          ${activeJob.status === 'in_progress' ? `<button class="btn btn-primary btn-sm btn-block" onclick="customerView.openPaymentModal('${activeJob.id}')"><i class="fa-solid fa-credit-card"></i> Pay & Complete</button>` : ''}
        </div>
      </div>
    `;
  }

  renderBidsList(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const activeJob = window.store.state.jobs.find(j => 
      j.customerId === window.store.state.currentUser.id && j.status === 'open'
    );

    if (!activeJob) {
      el.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; padding:10px 0; text-align:center;">No open job pending bids.</div>`;
      return;
    }

    const bids = window.store.state.bids.filter(b => b.jobId === activeJob.id && b.status !== 'declined');

    if (bids.length === 0) {
      el.innerHTML = `
        <div style="text-align:center; padding:1.5rem; background:#0f172a; border-radius:12px; border:1px dashed var(--card-border);">
          <div class="spinner-border text-emerald-500" role="status" style="margin-bottom:8px;">
            <i class="fa-solid fa-circle-notch fa-spin fa-2x" style="color:var(--primary);"></i>
          </div>
          <p style="font-weight:600; font-size:0.9rem;">Broadcasting to nearby verified providers...</p>
          <span style="font-size:0.78rem; color:var(--text-muted);">Bids will appear here in real time.</span>
        </div>
      `;
      return;
    }

    let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <h4 style="font-size:0.95rem; font-weight:700;">Incoming Bids (${bids.length})</h4>
      <span style="font-size:0.75rem; color:var(--accent-gold);"><i class="fa-solid fa-sliders"></i> InDrive Model</span>
    </div>`;

    bids.forEach(b => {
      html += `
        <div class="bid-card">
          <div class="bid-header">
            <div class="bid-provider">
              <div class="avatar">${b.providerName.substring(0,2).toUpperCase()}</div>
              <div>
                <h4 style="font-size:0.95rem; font-weight:700; margin:0;">${b.providerName}</h4>
                <div style="font-size:0.78rem; color:var(--text-muted); display:flex; gap:8px;">
                  <span><i class="fa-solid fa-star" style="color:var(--accent-gold);"></i> ${b.providerRating}</span>
                  <span><i class="fa-solid fa-clock"></i> ${b.etaMinutes} mins ETA</span>
                  ${b.isVerified ? '<span style="color:var(--primary);"><i class="fa-solid fa-circle-check"></i> KYC</span>' : ''}
                </div>
              </div>
            </div>
            <div style="text-align:right;">
              <div class="bid-price">$${b.counterPrice || b.price}</div>
              ${b.counterPrice ? `<span class="bid-counter-badge">You Countered $${b.counterPrice}</span>` : ''}
            </div>
          </div>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:10px 0;">"${b.message}"</p>
          
          <div style="display:flex; gap:8px; justify-content:flex-end;">
            <button class="btn btn-outline btn-sm" onclick="customerView.openCounterModal('${b.id}', ${b.price})">
              <i class="fa-solid fa-arrow-rotate-left"></i> Counter
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.store.acceptBid('${b.id}'); app.showToast('Bid accepted! Provider notified.');">
              <i class="fa-solid fa-check"></i> Accept Bid
            </button>
          </div>
        </div>
      `;
    });

    el.innerHTML = html;
  }

  openCounterModal(bidId, originalPrice) {
    this.selectedBidId = bidId;
    document.getElementById('counterModalOriginalPrice').innerText = '$' + originalPrice;
    document.getElementById('counterPriceInput').value = originalPrice - 5;
    app.showModal('counterBidModal');
  }

  submitCounterOffer() {
    const price = document.getElementById('counterPriceInput').value;
    if (!price || price <= 0) return;
    window.store.counterBid(this.selectedBidId, price);
    app.hideModal('counterBidModal');
    app.showToast(`Counter offer of $${price} sent to provider!`);
  }

  openPaymentModal(jobId) {
    const job = window.store.state.jobs.find(j => j.id === jobId);
    if (!job) return;

    this.currentPayingJob = job;
    document.getElementById('paymentAmountText').innerText = '$' + (job.finalPrice || 65);
    app.showModal('paymentModal');
  }

  processPayment() {
    if (!this.currentPayingJob) return;

    window.store.updateJobStatus(this.currentPayingJob.id, 'completed');
    app.hideModal('paymentModal');
    app.showModal('ratingModal');
  }

  submitRating() {
    app.hideModal('ratingModal');
    app.showToast('Thank you! Your rating and review have been published.');
  }
}

window.customerView = new CustomerView();
