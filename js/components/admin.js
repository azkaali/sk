/* SkillConnect - Admin Web Console Component */

class AdminView {
  renderKycQueue(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const subs = window.store.state.kycSubmissions;

    if (subs.length === 0) {
      el.innerHTML = `<div style="color:var(--text-muted); padding:1rem; text-align:center;">No pending provider verification submissions.</div>`;
      return;
    }

    let html = `
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
          <thead>
            <tr style="border-bottom:1px solid var(--card-border); color:var(--text-muted); text-align:left;">
              <th style="padding:8px;">Provider</th>
              <th style="padding:8px;">Category</th>
              <th style="padding:8px;">Exp</th>
              <th style="padding:8px;">Documents</th>
              <th style="padding:8px;">Status</th>
              <th style="padding:8px; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    subs.forEach(s => {
      html += `
        <tr style="border-bottom:1px solid var(--card-border);">
          <td style="padding:10px 8px;">
            <div style="font-weight:700;">${s.name}</div>
            <span style="font-size:0.75rem; color:var(--text-muted);">${s.phone}</span>
          </td>
          <td style="padding:8px;"><span style="text-transform:capitalize;">${s.category}</span></td>
          <td style="padding:8px;">${s.experienceYears} yrs</td>
          <td style="padding:8px; color:var(--accent-blue);">
            <i class="fa-solid fa-id-card"></i> ${s.idDocument}<br>
            <i class="fa-solid fa-camera"></i> ${s.selfie}
          </td>
          <td style="padding:8px;">
            <span class="status-pill ${s.status}">${s.status}</span>
          </td>
          <td style="padding:8px; text-align:right;">
            ${s.status === 'pending' ? `
              <button class="btn btn-primary btn-sm" onclick="window.store.approveKYC('${s.id}'); app.showToast('Provider KYC approved!');">
                <i class="fa-solid fa-check"></i> Approve
              </button>
            ` : '<span style="color:var(--primary);"><i class="fa-solid fa-circle-check"></i> Verified</span>'}
          </td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
    el.innerHTML = html;
  }

  renderGuardrails(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const cats = window.store.state.categories;

    let html = `
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:1rem;">
    `;

    cats.forEach(c => {
      html += `
        <div style="background:#0f172a; border:1px solid var(--card-border); padding:1rem; border-radius:10px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
            <i class="fa-solid ${c.icon}" style="color:var(--primary);"></i>
            <h4 style="font-weight:700; font-size:0.95rem; margin:0;">${c.name}</h4>
          </div>
          
          <div class="form-group" style="margin-bottom:8px;">
            <label class="form-label" style="font-size:0.75rem;">Min / Max Price Guardrail ($)</label>
            <div style="display:flex; gap:6px;">
              <input type="number" id="min_${c.id}" value="${c.minBid}" class="form-control" style="padding:4px 8px; font-size:0.8rem;">
              <input type="number" id="max_${c.id}" value="${c.maxBid}" class="form-control" style="padding:4px 8px; font-size:0.8rem;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom:10px;">
            <label class="form-label" style="font-size:0.75rem;">Platform Commission (%)</label>
            <input type="number" id="comm_${c.id}" value="${c.commissionPct}" class="form-control" style="padding:4px 8px; font-size:0.8rem;">
          </div>

          <button class="btn btn-secondary btn-sm btn-block" onclick="adminView.saveGuardrail('${c.id}')">
            <i class="fa-solid fa-floppy-disk"></i> Update Config
          </button>
        </div>
      `;
    });

    html += `</div>`;
    el.innerHTML = html;
  }

  saveGuardrail(catId) {
    const min = document.getElementById(`min_${catId}`).value;
    const max = document.getElementById(`max_${catId}`).value;
    const comm = document.getElementById(`comm_${catId}`).value;

    window.store.updateCategoryGuardrails(catId, min, max, comm);
    app.showToast('Category price guardrails updated!');
  }

  renderDisputes(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const disps = window.store.state.disputes;

    if (disps.length === 0) {
      el.innerHTML = `<div style="color:var(--text-muted); padding:1rem; text-align:center;">No open disputes in queue.</div>`;
      return;
    }

    let html = '';
    disps.forEach(d => {
      html += `
        <div class="bid-card" style="border-color:var(--accent-red);">
          <div class="bid-header">
            <div>
              <span class="status-pill disputed">OPEN DISPUTE #${d.id}</span>
              <h4 style="font-size:0.95rem; font-weight:700; margin-top:4px;">Job: ${d.jobTitle} ($${d.amount})</h4>
            </div>
            <span style="font-size:0.78rem; color:var(--text-muted);">${d.createdAt}</span>
          </div>
          <p style="font-size:0.82rem; color:var(--text-muted); margin:8px 0;"><strong>Claim:</strong> ${d.reason}</p>
          <div style="font-size:0.78rem; color:var(--accent-blue); margin-bottom:10px;">
            <i class="fa-solid fa-paperclip"></i> Evidence attached: ${d.evidencePhoto}
          </div>
          
          <div style="display:flex; gap:8px; justify-content:flex-end;">
            ${d.status === 'open' ? `
              <button class="btn btn-outline btn-sm" onclick="window.store.resolveDispute('${d.id}', 'refund'); app.showToast('Full refund issued to customer!');">
                <i class="fa-solid fa-rotate-left"></i> Issue Refund
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.store.resolveDispute('${d.id}', 'payout'); app.showToast('Payout released to provider.');">
                <i class="fa-solid fa-gavel"></i> Release Payout
              </button>
            ` : `<span style="font-weight:700; color:var(--primary); font-size:0.85rem;">Resolved: ${d.status}</span>`}
          </div>
        </div>
      `;
    });

    el.innerHTML = html;
  }

  renderAnalytics(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const stats = window.store.state.adminAnalytics;

    el.innerHTML = `
      <div class="grid-3col" style="margin-bottom:1rem;">
        <div class="stat-card">
          <span class="stat-label">Gross Marketplace Volume (GMV)</span>
          <div class="stat-value" style="color:var(--primary);">${stats.totalGmv}</div>
          <span class="stat-trend"><i class="fa-solid fa-arrow-trend-up"></i> +14.2% vs last month</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Platform Commission Revenue</span>
          <div class="stat-value" style="color:var(--accent-gold);">${stats.commissionEarned}</div>
          <span class="stat-trend"><i class="fa-solid fa-piggy-bank"></i> Net platform take</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Active Users & Providers</span>
          <div class="stat-value">${stats.activeUsers}</div>
          <span class="stat-trend"><i class="fa-solid fa-users"></i> 840 Customers / 440 Providers</span>
        </div>
      </div>

      <div class="grid-3col">
        <div class="stat-card">
          <span class="stat-label">Completed Jobs</span>
          <div class="stat-value">${stats.completedJobs}</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Avg Time to First Bid</span>
          <div class="stat-value" style="color:var(--accent-blue);">${stats.avgBidTimeSec}</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Job Cancellation Rate</span>
          <div class="stat-value" style="color:var(--accent-purple);">${stats.cancellationRate}</div>
        </div>
      </div>
    `;
  }
}

window.adminView = new AdminView();
