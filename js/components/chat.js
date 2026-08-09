/* SkillConnect - In-App Chat & Masked Calling Component */

class ChatComponent {
  constructor() {
    this.currentJobId = null;
  }

  openChatModal(jobId) {
    this.currentJobId = jobId;
    const job = window.store.state.jobs.find(j => j.id === jobId);
    if (!job) return;

    document.getElementById('chatModalTitle').innerText = `Chat: ${job.title}`;
    this.renderMessages();
    app.showModal('chatModal');
  }

  renderMessages() {
    const el = document.getElementById('chatMessagesContainer');
    if (!el || !this.currentJobId) return;

    const messages = window.store.state.chats[this.currentJobId] || [];
    const currentUserId = window.store.state.currentRole === 'customer' 
      ? window.store.state.currentUser.id 
      : window.store.state.currentProvider.id;

    if (messages.length === 0) {
      el.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.82rem; margin-top:2rem;">No messages yet. Send a message to start negotiation or coordination!</div>`;
      return;
    }

    let html = '';
    messages.forEach(m => {
      const isSentByMe = m.sender === currentUserId;
      html += `
        <div class="chat-bubble ${isSentByMe ? 'sent' : 'received'}">
          <div style="font-size:0.7rem; opacity:0.8; font-weight:700; margin-bottom:2px;">${m.senderName}</div>
          <div>${m.text}</div>
          <span class="chat-time">${m.timestamp}</span>
        </div>
      `;
    });

    el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
  }

  sendMessage() {
    const input = document.getElementById('chatInputText');
    if (!input || !input.value.trim() || !this.currentJobId) return;

    const text = input.value.trim();
    input.value = '';

    const isCustomer = window.store.state.currentRole === 'customer';
    const senderId = isCustomer ? window.store.state.currentUser.id : window.store.state.currentProvider.id;
    const senderName = isCustomer ? window.store.state.currentUser.name : window.store.state.currentProvider.name;

    window.store.sendChatMessage(this.currentJobId, senderId, senderName, text);
    this.renderMessages();

    // Auto simulated reply from provider if user is customer
    if (isCustomer) {
      setTimeout(() => {
        window.store.sendChatMessage(this.currentJobId, 'p_user_1', 'Alex Rivers', 'Got it! I am reviewing the details and on my way.');
        this.renderMessages();
      }, 1500);
    }
  }

  triggerMaskedCall() {
    app.showModal('maskedCallModal');
    let sec = 0;
    const timerEl = document.getElementById('callTimerText');
    if (this.callInterval) clearInterval(this.callInterval);

    this.callInterval = setInterval(() => {
      sec++;
      const m = String(Math.floor(sec / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      if (timerEl) timerEl.innerText = `${m}:${s}`;
    }, 1000);
  }

  endMaskedCall() {
    if (this.callInterval) clearInterval(this.callInterval);
    app.hideModal('maskedCallModal');
    app.showToast('Call ended. Voice masking active.');
  }
}

window.chatComp = new ChatComponent();
