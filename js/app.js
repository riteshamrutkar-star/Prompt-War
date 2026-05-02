/**
 * ElectIQ – Main App Module
 * Orchestrates all modules and handles global interactions
 */
'use strict';

/* =============================================
   GLOBAL HELPERS
   ============================================= */

/**
 * Scroll to a section by ID
 * @param {string} sectionId
 */
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    const offset = 80; // navbar height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.innerHTML = `<span aria-hidden="true">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* =============================================
   ACCESSIBILITY CONTROLS
   ============================================= */
function toggleHighContrast() {
  document.body.classList.toggle('high-contrast');
  const enabled = document.body.classList.contains('high-contrast');
  localStorage.setItem('electiq_hc', enabled ? '1' : '0');
  showToast(`High contrast ${enabled ? 'enabled' : 'disabled'}`, 'info');
}

function increaseFontSize() {
  document.body.classList.toggle('large-text');
  const enabled = document.body.classList.contains('large-text');
  localStorage.setItem('electiq_lf', enabled ? '1' : '0');
  showToast(`Larger text ${enabled ? 'enabled' : 'disabled'}`, 'info');
}

function resetAccessibility() {
  document.body.classList.remove('high-contrast', 'large-text');
  localStorage.removeItem('electiq_hc');
  localStorage.removeItem('electiq_lf');
  showToast('Accessibility settings reset', 'info');
}

function loadAccessibilityPrefs() {
  if (localStorage.getItem('electiq_hc') === '1') document.body.classList.add('high-contrast');
  if (localStorage.getItem('electiq_lf') === '1') document.body.classList.add('large-text');
}

/* =============================================
   THEME TOGGLE (Light / Dark Mode)
   ============================================= */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;
  
  const iconSun = toggleBtn.querySelector('.icon-sun');
  const iconMoon = toggleBtn.querySelector('.icon-moon');
  
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('electiq_theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  
  const isLightMode = savedTheme === 'light' || (!savedTheme && prefersLight);
  
  if (isLightMode) {
    document.documentElement.setAttribute('data-theme', 'light');
    iconSun.style.display = 'none';
    iconMoon.style.display = 'inline';
  }

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      iconSun.style.display = 'none';
      iconMoon.style.display = 'inline';
    } else {
      document.documentElement.removeAttribute('data-theme');
      iconMoon.style.display = 'none';
      iconSun.style.display = 'inline';
    }
    
    localStorage.setItem('electiq_theme', newTheme);
    showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Mode Enabled`, 'info');
  });
}

/* =============================================
   NAVBAR
   ============================================= */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile menu toggle
  navToggle?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    mobileMenu?.setAttribute('aria-modal', String(isOpen));
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px 0px 0px' });

  sections.forEach(s => observer.observe(s));
}

function closeMobileMenu() {
  document.getElementById('mobileMenu')?.classList.remove('open');
  document.getElementById('navToggle')?.setAttribute('aria-expanded', 'false');
}

/* =============================================
   PARTICLES
   ============================================= */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const colors = ['#6C63FF', '#F59E0B', '#10B981', '#EC4899'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 3;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 8 + 6;
    const delay = Math.random() * 5;
    const dx1 = (Math.random() - 0.5) * 60;
    const dy1 = (Math.random() - 0.5) * 60;
    const dx2 = (Math.random() - 0.5) * 60;
    const dy2 = (Math.random() - 0.5) * 60;

    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${x}%;top:${y}%;
      background:${color};
      --duration:${duration}s;--delay:${delay}s;
      --dx1:${dx1}px;--dy1:${dy1}px;
      --dx2:${dx2}px;--dy2:${dy2}px;
    `;
    container.appendChild(p);
  }
}

/* =============================================
   INTERSECTION OBSERVER (Reveal animations)
   ============================================= */
function observeElements(elements) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => io.observe(el));
}

window.observeElements = observeElements;

function initReveal() {
  observeElements(document.querySelectorAll('.reveal, .stagger-children'));
}

/* =============================================
   SMOOTH NAV LINK SCROLL
   ============================================= */
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        scrollToSection(target.id);
      }
    });
  });
}

/* =============================================
   BALLOT IMAGE ANALYZER
   ============================================= */
function initBallotAnalyzer() {
  const uploadZone  = document.getElementById('ballotUploadZone');
  const fileInput   = document.getElementById('ballotFileInput');
  if (!uploadZone || !fileInput) return;

  // Click to open file picker
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });

  // Drag-and-drop
  uploadZone.addEventListener('dragover', e => {
    e.preventDefault(); uploadZone.classList.add('drag-over');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault(); uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) processImageFile(file);
    fileInput.value = ''; // reset so same file can be re-uploaded
  });

  function processImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (JPG, PNG, WEBP)', 'error'); return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast('Image must be under 4MB', 'error'); return;
    }
    if (!GeminiService.hasApiKey()) {
      showToast('Enter your Gemini API key first to use the Ballot Analyzer!', 'error');
      return;
    }

    // Show preview and scroll to chat
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl   = e.target.result;
      const base64    = dataUrl.split(',')[1];
      const mimeType  = file.type;

      // Add a user message showing the uploaded image
      scrollToSection('assistant');

      setTimeout(async () => {
        const chatMessages = document.getElementById('chatMessages');
        const userMsg = document.createElement('div');
        userMsg.className = 'message user-message';
        userMsg.innerHTML = `
          <div class="message-avatar" aria-hidden="true">👤</div>
          <div class="message-bubble">
            <div class="message-header">
              <span class="message-sender">You</span>
              <span class="message-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            <div class="message-text">
              <p>📷 <strong>Uploaded image for analysis</strong></p>
              <img src="${dataUrl}" alt="Uploaded ballot image" style="max-width:200px;border-radius:8px;margin-top:.5rem;display:block;" />
            </div>
          </div>
        `;
        chatMessages.appendChild(userMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Stream the AI analysis into a bot bubble
        const botMsg  = document.createElement('div');
        botMsg.className = 'message bot-message';
        const botId   = `ballot-${Date.now()}`;
        botMsg.innerHTML = `
          <div class="message-avatar" aria-hidden="true">🤖</div>
          <div class="message-bubble">
            <div class="message-header">
              <span class="message-sender">ElectIQ Assistant</span>
              <span class="message-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            <div class="message-text" id="${botId}">
              <p><em>🔍 Analyzing your image...</em></p>
            </div>
            <div class="message-actions">
              <button class="msg-action-btn" onclick="ChatUI.copyMessage(this)" aria-label="Copy this message">📋 Copy</button>
            </div>
          </div>
        `;
        chatMessages.appendChild(botMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const textEl = document.getElementById(botId);
        let accumulated = '';

        try {
          await GeminiService.analyzeImage(base64, mimeType, (token) => {
            accumulated += token;
            // Simple markdown render inline
            textEl.innerHTML = accumulated
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br>');
            chatMessages.scrollTop = chatMessages.scrollHeight;
          });
          showToast('Image analyzed!', 'success');
        } catch (err) {
          textEl.innerHTML = `<p style="color:var(--danger)">${GeminiService.getErrorMessage(err)}</p>`;
        }
      }, 500);
    };
    reader.readAsDataURL(file);
  }
}

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  loadAccessibilityPrefs();
  initThemeToggle();
  initNavbar();
  initParticles();

  ProcessModule.render();
  TimelineModule.init();
  QuizModule.init();
  GlossaryModule.render();
  ChatUI.init();
  initBallotAnalyzer();

  initSmoothLinks();
  setTimeout(initReveal, 100);

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey && e.key === '/') || (e.key === '?' && !e.target.matches('input, textarea'))) {
      e.preventDefault();
      scrollToSection('assistant');
      setTimeout(() => document.getElementById('chatInput')?.focus(), 500);
    }
    if (e.key === 'Escape') closeMobileMenu();
  });

  console.info('🗳️ ElectIQ v2.0 loaded. Streaming | Vision | AI Quiz | Civic Report. Built for PromptWars Virtual.');
});

// Expose globals needed by inline HTML handlers
window.scrollToSection = scrollToSection;
window.showToast = showToast;
window.closeMobileMenu = closeMobileMenu;
window.toggleHighContrast = toggleHighContrast;
window.increaseFontSize = increaseFontSize;
window.resetAccessibility = resetAccessibility;
window.copyMessage = (btn) => ChatUI.copyMessage(btn);
