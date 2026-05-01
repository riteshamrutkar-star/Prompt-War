/**
 * ElectIQ – Chat UI Module
 * Handles all chat interface interactions
 */

'use strict';

const ChatUI = (() => {
  let isLoading = false;

  /* ---------- DOM refs ---------- */
  const $ = id => document.getElementById(id);
  const chatMessages = $('chatMessages');
  const chatInput = $('chatInput');
  const sendBtn = $('sendBtn');
  const charCount = $('charCount');
  const typingIndicator = $('typingIndicator');
  const apiBanner = $('apiBanner');
  const apiBannerText = $('apiBannerText');
  const apiKeyInput = $('apiKeyInput');
  const apiKeyToggle = $('apiKeyToggle');
  const saveKeyBtn = $('saveKeyBtn');
  const clearChatBtn = $('clearChatBtn');
  const exportChatBtn = $('exportChatBtn');
  const liveRegion = $('liveRegion');

  /* ---------- Helpers ---------- */
  function formatTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Convert markdown-like text to safe HTML
   * Supports: **bold**, *italic*, `code`, bullet lists, numbered lists, headings
   */
  function formatResponse(text) {
    let html = sanitizeHTML(text);

    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Inline code
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // Numbered list
    html = html.replace(/(?:^|\n)(\d+\. .+)/g, (m, item) => `<li>${item.replace(/^\d+\. /, '')}</li>`);
    html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, m => `<ol>${m}</ol>`);

    // Bullet list
    html = html.replace(/(?:^|\n)[•\-\*] (.+)/g, (m, item) => `<li>${item}</li>`);
    html = html.replace(/(?<![<\/])(<li>[\s\S]*?<\/li>)+(?!<\/ol)/g, m => `<ul>${m}</ul>`);

    // Paragraphs
    const lines = html.split(/\n\n+/);
    html = lines.map(line => {
      line = line.trim();
      if (!line) return '';
      if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<ol') || line.startsWith('<li')) return line;
      return `<p>${line.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
  }

  /**
   * Append a message to the chat
   * @param {'user'|'bot'|'error'} role
   * @param {string} text
   * @returns {HTMLElement} The message element
   */
  function appendMessage(role, text) {
    const isUser = role === 'user';
    const isError = role === 'error';
    const msgId = `msg-${Date.now()}`;

    const msgEl = document.createElement('div');
    msgEl.className = `message ${isUser ? 'user-message' : 'bot-message'} ${isError ? 'error-message' : ''}`;
    msgEl.setAttribute('data-message-id', msgId);
    msgEl.setAttribute('role', 'article');
    msgEl.setAttribute('aria-label', `${isUser ? 'You' : 'Assistant'}: ${text.slice(0, 100)}`);

    const content = isUser ? `<p>${sanitizeHTML(text)}</p>` : formatResponse(text);

    msgEl.innerHTML = `
      <div class="message-avatar" aria-hidden="true">${isUser ? '👤' : isError ? '⚠️' : '🤖'}</div>
      <div class="message-bubble">
        <div class="message-header">
          <span class="message-sender">${isUser ? 'You' : 'ElectIQ Assistant'}</span>
          <span class="message-time" aria-label="Sent at ${formatTime()}">${formatTime()}</span>
        </div>
        <div class="message-text">${content}</div>
        ${!isUser ? `<div class="message-actions">
          <button class="msg-action-btn" onclick="ChatUI.copyMessage(this)" aria-label="Copy this message">📋 Copy</button>
        </div>` : ''}
      </div>
    `;

    chatMessages.appendChild(msgEl);
    scrollToBottom();
    return msgEl;
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    typingIndicator.hidden = false;
    typingIndicator.removeAttribute('hidden');
    scrollToBottom();
  }

  function hideTyping() {
    typingIndicator.hidden = true;
  }

  const typingText = $('typingText');

  function setLoading(state) {
    isLoading = state;
    sendBtn.disabled = state || !chatInput.value.trim();
    chatInput.disabled = state;
    if (state) {
      if (typingText) typingText.textContent = 'Thinking...';
      showTyping();
    } else {
      if (typingText) typingText.textContent = 'Thinking...';
      hideTyping();
    }
  }

  function announce(message) {
    liveRegion.textContent = '';
    setTimeout(() => { liveRegion.textContent = message; }, 50);
  }

  /* ---------- Banner ---------- */
  function updateBanner(type, text) {
    apiBanner.className = `api-banner ${type}`;
    apiBannerText.textContent = text;
    if (type === 'hidden') apiBanner.classList.add('hidden');
    else apiBanner.classList.remove('hidden');
  }

  function refreshBanner() {
    if (GeminiService.hasApiKey()) {
      updateBanner('success', '✅ Gemini AI connected! Ask me anything about elections.');
    } else {
      updateBanner('', '🔑 Enter your Gemini API key in the sidebar to enable AI responses.');
    }
  }

  /* ---------- Send message ---------- */
  async function sendMessage(text) {
    const message = (text || chatInput.value).trim();
    if (!message || isLoading) return;

    chatInput.value = '';
    charCount.textContent = '0/500';
    sendBtn.disabled = true;
    autoResizeTextarea();

    appendMessage('user', message);
    setLoading(true);
    announce('Sending message...');

    try {
      const response = await GeminiService.sendMessage(message);
      appendMessage('bot', response);
      announce('Response received');
    } catch (err) {
      const errMsg = GeminiService.getErrorMessage(err);
      appendMessage('error', errMsg);
      announce('Error: ' + errMsg);
    } finally {
      setLoading(false);
      chatInput.focus();
    }
  }

  /* ---------- Copy message ---------- */
  function copyMessage(btn) {
    const bubble = btn.closest('.message-bubble');
    const textEl = bubble.querySelector('.message-text');
    const text = textEl.innerText || textEl.textContent;
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '✅ Copied!';
      setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    }).catch(() => {
      btn.textContent = '❌ Failed';
      setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    });
  }

  /* ---------- Clear chat ---------- */
  function clearChat() {
    // Keep only welcome message
    const msgs = chatMessages.querySelectorAll('.message:not(.welcome-message)');
    msgs.forEach(m => m.remove());
    GeminiService.clearHistory();
    showToast('Chat cleared', 'info');
    announce('Chat cleared');
  }

  /* ---------- Export chat ---------- */
  function exportChat() {
    const messages = chatMessages.querySelectorAll('.message');
    let exportText = `ElectIQ Chat Export – ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;
    messages.forEach(msg => {
      const sender = msg.querySelector('.message-sender')?.textContent || '';
      const time = msg.querySelector('.message-time')?.textContent || '';
      const text = msg.querySelector('.message-text')?.innerText || '';
      exportText += `[${time}] ${sender}:\n${text}\n\n`;
    });

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electiq-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chat exported!', 'success');
  }

  /* ---------- Auto-resize textarea ---------- */
  function autoResizeTextarea() {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  }

  /* ---------- Init ---------- */
  function init() {
    if (!chatMessages) return;

    // Input events
    chatInput.addEventListener('input', () => {
      const len = chatInput.value.length;
      charCount.textContent = `${len}/500`;
      sendBtn.disabled = len === 0 || isLoading;
      if (len > 500) chatInput.value = chatInput.value.slice(0, 500);
      autoResizeTextarea();
    });

    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    sendBtn.addEventListener('click', () => sendMessage());

    // API key
    saveKeyBtn.addEventListener('click', () => {
      const key = apiKeyInput.value.trim();
      try {
        GeminiService.saveApiKey(key);
        refreshBanner();
        apiKeyInput.value = '';
        showToast('API key saved!', 'success');
        announce('API key saved successfully');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    apiKeyToggle.addEventListener('click', () => {
      const isPassword = apiKeyInput.type === 'password';
      apiKeyInput.type = isPassword ? 'text' : 'password';
      apiKeyToggle.textContent = isPassword ? '🙈' : '👁️';
      apiKeyToggle.setAttribute('aria-pressed', String(isPassword));
    });

    // Clear & export
    clearChatBtn.addEventListener('click', clearChat);
    exportChatBtn.addEventListener('click', exportChat);

    // Topic chips
    document.querySelectorAll('.topic-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-question');
        if (q) sendMessage(q);
      });
    });

    // Init banner
    refreshBanner();

    // Listen for live API status updates (e.g., rate-limit retries)
    window.addEventListener('gemini:status', (e) => {
      if (typingText && isLoading) {
        typingText.textContent = e.detail.message;
      }
    });
  }

  return { init, copyMessage, sendMessage, clearChat, exportChat };
})();

window.ChatUI = ChatUI;
