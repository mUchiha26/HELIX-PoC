/* =============================================================
   HELIX PLATFORM — AI-CHAT.JS
   Chat interface, message sending, and history loading
   ============================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.requireAuth();
  if (!user) return;
  Auth.updateSidebarUser(user);
  Auth.buildSidebar(user.role);
  Auth.setActiveNav();
  setupSidebar();
  loadChatHistory();
  setupChatInput();
});

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('sidebarToggle');
  toggle?.addEventListener('click', () => { sidebar?.classList.toggle('open'); overlay?.classList.toggle('active'); });
  overlay?.addEventListener('click', () => { sidebar?.classList.remove('open'); overlay?.classList.remove('active'); });
}

function setupChatInput() {
  const input = document.getElementById('chatInput');
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  // Auto-resize textarea
  input?.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const btn = document.getElementById('chatSend');
  const msg = input?.value?.trim();
  if (!msg) return;

  // Add user message to UI
  appendMessage('user', msg);
  input.value = '';
  input.style.height = 'auto';
  btn.disabled = true;

  // Show typing indicator
  const typingId = appendTyping();

  const result = await aiApi.chat(msg);
  removeTyping(typingId);
  btn.disabled = false;

  if (result?.success) {
    appendMessage('assistant', result.data.response || 'No response generated.');
  } else {
    appendMessage('assistant', 'I encountered an error processing your request. Please try again.');
  }
}

function sendSuggestion(text) {
  const input = document.getElementById('chatInput');
  if (input) { input.value = text; sendMessage(); }
}

function appendMessage(role, content) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const avatar = role === 'assistant'
    ? '<div class="msg-avatar"><i class="bi bi-cpu-fill"></i></div>'
    : '<div class="msg-avatar">You</div>';

  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const msgEl = document.createElement('div');
  msgEl.className = `chat-msg msg-${role}`;
  msgEl.innerHTML = `
    ${avatar}
    <div>
      <div class="msg-bubble">${content}</div>
      <div class="msg-time">${time}</div>
    </div>
  `;
  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;
}

function appendTyping() {
  const container = document.getElementById('chatMessages');
  if (!container) return '';

  const id = 'typing-' + Date.now();
  const el = document.createElement('div');
  el.id = id;
  el.className = 'chat-msg msg-assistant';
  el.innerHTML = `
    <div class="msg-avatar"><i class="bi bi-cpu-fill"></i></div>
    <div><div class="msg-bubble"><div class="loader-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div></div></div>
  `;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

async function loadChatHistory() {
  const data = await aiApi.history();
  if (data?.success && data.data?.length) {
    const container = document.getElementById('chatMessages');
    // Clear default welcome message
    container.innerHTML = '';
    data.data.forEach(msg => {
      appendMessage(msg.message_role === 'user' ? 'user' : 'assistant', msg.content);
    });
  }
}
