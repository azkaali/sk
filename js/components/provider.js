/* SkillConnect - Provider View Component */

class ProviderView {
  constructor() {
    this.selectedJobForBid = null;
  }

  renderProviderHeader(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const p = window.store.state.currentProvider;

    el.innerHTML = `
      <div class="card" style="margin-bottom:1rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="avatar" style="width:50px; height:50px; font-size:1.2rem;">${p.name.substring(0,2).toUpperCase()}</div>
            <div>
              <h3 style="font-size:1.1rem; font-weight:800; margin:0;">${p.name}</h3>
              <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">
                <span style="color:var(--accent-gold); font-weight:700;"><i class="fa-solid fa-star"></i> ${p.rating}</span> • 
                <span>${p.jobCount} Jobs Done</span> • 
                <span style="color:var(--primary); font-weight:700;"><i class="fa-solid fa-shield-check"></i> ${p.verificationStatus.toUpperCase()}</span>
              </p>
            </div>
          </div>

          <!-- Driver Availability Toggle -->
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="text-align:right;">
              <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Availability Status</span>
              <strong style="color: ${p.isOnline ? 'var(--primary)' : 'var(--accent-red)'}; font-size:0.9rem;">
                ${p.isOnline ? '🟢 ONLINE (Broadcasting)' : '🔴 OFFLINE'}
              </strong>
            </div>
            <button class="btn ${p.isOnline ? 'btn-danger' : 'btn-primary'} btn-sm" onclick="window.store.toggleProviderOnline(!window.store.state.currentProvider.isOnline)">
              ${p.isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>

        <!-- Service Radius Slider -->
        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--card-border); display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="font-size:0.82rem; color:var(--text-muted);">
            <i class="fa-solid fa-location-crosshairs"></i> Service Radius: <strong>${p.serviceRadiusKm} km</strong>
          </div>
          <input type="range" min="5" max="50" value="${p.serviceRadiusKm}" style="accent-color:var(--primary); cursor:pointer;" 
            onchange="window.store.state.currentProvider.serviceRadiusKm = Number(this.value); window.store.save();">
        </div>
      </div>
    `;
  }

  renderJobBroadcastFeed(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const p = window.store.state.currentProvider;

    if (!p.isOnline) {
      el.innerHTML = `
        <div class="card" style="text-align:center; padding:2rem;">
          <i class="fa-solid fa-moon fa-2x" style="color:var(--text-muted); margin-bottom:8px;"></i>
          <h4 style="font-weight:700;">You are currently Offline</h4>
          <p style="font-size:0.85rem; color:var(--text-muted);">Switch your availability toggle to Online to receive broadcasted job leads in your radius.</p>
        </div>
      `;
      return;
    }

    const openJobs = window.store.state.jobs.filter(j => j.status === 'open');

    if (openJobs.length === 0) {
      el.innerHTML = `
        <div class="card" style="text-align:center; padding:2rem;">
          <i class="fa-solid fa-radar fa-2x" style="color:var(--primary); margin-bottom:8px;"></i>
          <h4 style="font-weight:700;">Scanning for nearby jobs...</h4>
          <p style="font-size:0.85rem; color:var(--text-muted);">New customer requests in ${p.category} will show here instantly.</p>
        </div>
      `;
      return;
    }

    let html = '';
    openJobs.forEach(j => {
      // Check if provider already bid
      const existingBid = window.store.state.bids.find(b => b.jobId === j.id && b.providerId === p.id);

      html += `
        <div class="card" style="margin-bottom:1rem;">
          <div class="card-header">
            <div>
              <span class="status-pill open">NEW JOB REQUEST</span>
              <h3 class="card-title" style="margin-top:6px;">${j.title}</h3>
            </div>
            <span style="font-size:1.1rem; font-weight:800; color:var(--primary);">${j.budgetRange}</span>
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px;">${j.description}</p>
          <div style="font-size:0.78rem; color:var(--text-muted); display:flex; gap:12px; margin-bottom:12px;">
            <span><i class="fa-solid fa-location-dot"></i> ${j.location} (~2.4 km)</span>
            <span><i class="fa-solid fa-user"></i> ${j.customerName}</span>
          </div>

          ${existingBid ? `
            <div style="background:#0f172a; padding:8px 12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.82rem; color:var(--accent-gold);"><i class="fa-solid fa-circle-check"></i> Bid Submitted: <strong>$${existingBid.counterPrice || existingBid.price}</strong></span>
              <span style="font-size:0.78rem; color:var(--text-muted);">Status: ${existingBid.status}</span>
            </div>
          ` : `
            <button class="btn btn-primary btn-block" onclick="providerView.openBidModal('${j.id}')">
              <i class="fa-solid fa-gavel"></i> Place Competitive Bid
            </button>
          `}
        </div>
      `;
    });

    el.innerHTML = html;
  }

  renderActiveProviderJob(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const p = window.store.state.currentProvider;
    const activeJob = window.store.state.jobs.find(j => 
      j.providerId === p.id && j.status !== 'completed' && j.status !== 'open'
    );

    if (!activeJob) {
      el.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; padding:8px; text-align:center;">No currently assigned active job.</div>`;
      return;
    }

    let actionBtn = '';
    if (activeJob.status === 'accepted') {
      actionBtn = `<button class="btn btn-primary btn-block" onclick="providerView.updateStatus('${activeJob.id}', 'en_route')">
        <i class="fa-solid fa-truck-fast"></i> Mark En Route (Start GPS Tracking)
      </button>`;
    } else if (activeJob.status === 'en_route') {
      actionBtn = `<button class="btn btn-primary btn-block" onclick="providerView.updateStatus('${activeJob.id}', 'arrived')">
        <i class="fa-solid fa-door-open"></i> Mark Arrived at Customer Location
      </button>`;
    } else if (activeJob.status === 'arrived') {
      actionBtn = `<button class="btn btn-primary btn-block" onclick="providerView.updateStatus('${activeJob.id}', 'in_progress')">
        <i class="fa-solid fa-play"></i> Start Job Execution
      </button>`;
    } else if (activeJob.status === 'in_progress') {
      actionBtn = `<button class="btn btn-primary btn-block" onclick="providerView.completeJobWithPhoto('${activeJob.id}')">
        <i class="fa-solid fa-circle-check"></i> Upload Work Photo & Complete Job
      </button>`;
    }

    el.innerHTML = `
      <div class="card" style="border-color:var(--primary);">
        <div class="card-header">
          <span class="status-pill ${activeJob.status}">${activeJob.status.replace('_', ' ')}</span>
          <span style="font-size:1.1rem; font-weight:800; color:var(--primary);">$${activeJob.finalPrice || 65}</span>
        </div>
        <h3 class="card-title" style="margin-bottom:8px;">${activeJob.title}</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;"><i class="fa-solid fa-location-dot"></i> ${activeJob.location}</p>
        
        <div style="margin-bottom:12px; display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="app.openChat('${activeJob.id}')">
            <i class="fa-solid fa-comments"></i> Chat with ${activeJob.customerName}
          </button>
          <button class="btn btn-outline btn-sm" onclick="app.showToast('Calling customer (Masked phone line connected)...')">
            <i class="fa-solid fa-phone"></i> Masked Call
          </button>
        </div>

        ${actionBtn}
      </div>
    `;
  }

  openBidModal(jobId) {
    this.selectedJobForBid = window.store.state.jobs.find(j => j.id === jobId);
    if (!this.selectedJobForBid) return;

    const catConfig = window.store.state.categories.find(c => c.id === this.selectedJobForBid.category) || { minBid: 20, maxBid: 500 };

    document.getElementById('bidModalJobTitle').innerText = this.selectedJobForBid.title;
    document.getElementById('bidModalGuardrails').innerText = `Admin Price Guardrails: $${catConfig.minBid} - $${catConfig.maxBid}`;
    document.getElementById('bidPriceInput').value = 65;
    document.getElementById('bidEtaInput').value = 20;

    app.showModal('submitBidModal');
  }

  submitBidFromModal() {
    if (!this.selectedJobForBid) return;

    const price = document.getElementById('bidPriceInput').value;
    const eta = document.getElementById('bidEtaInput').value;
    const msg = document.getElementById('bidMessageInput').value || 'Ready to assist!';

    try {
      window.store.submitBid(this.selectedJobForBid.id, price, eta, msg);
      app.hideModal('submitBidModal');
      app.showToast('Your bid was broadcasted to the customer!');
    } catch (err) {
      alert(err.message);
    }
  }

  updateStatus(jobId, newStatus) {
    window.store.updateJobStatus(jobId, newStatus);
    if (newStatus === 'en_route') {
      const job = window.store.state.jobs.find(j => j.id === jobId);
      window.appMap.startEnRouteTracking(37.7765, -122.4180, job.lat, job.lng, () => {
        app.showToast('Provider has arrived at destination!');
      });
    }
    app.showToast(`Job status updated to ${newStatus.replace('_', ' ')}`);
  }

  completeJobWithPhoto(jobId) {
    window.store.updateJobStatus(jobId, 'completed', {
      afterPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300'
    });
    app.showToast('Job completed! Payment released to your SkillConnect wallet.');
  }

  renderWallet(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const p = window.store.state.currentProvider;

    let historyHtml = '';
    p.earningsHistory.forEach(h => {
      historyHtml += `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--card-border); font-size:0.85rem;">
          <div>
            <div style="font-weight:600;">${h.jobTitle}</div>
            <span style="font-size:0.75rem; color:var(--text-muted);">${h.date}</span>
          </div>
          <span style="font-weight:700; color:var(--primary);">+$${h.amount.toFixed(2)}</span>
        </div>
      `;
    });

    el.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="stat-label">SkillConnect Provider Wallet</span>
          <i class="fa-solid fa-wallet" style="color:var(--primary);"></i>
        </div>
        <div class="stat-value">$${p.walletBalance.toFixed(2)}</div>
        <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:12px;">Available for instant payout to linked bank / debit card.</p>
        <button class="btn btn-primary btn-sm btn-block" onclick="app.showToast('Payout request of $' + window.store.state.currentProvider.walletBalance.toFixed(2) + ' initiated!')">
          <i class="fa-solid fa-money-bill-transfer"></i> Request Instant Payout
        </button>
        <div style="margin-top:1rem;">
          <h5 style="font-size:0.85rem; font-weight:700; margin-bottom:8px;">Recent Earnings</h5>
          ${historyHtml}
        </div>
      </div>
    `;
  }
}

window.providerView = new ProviderView();
