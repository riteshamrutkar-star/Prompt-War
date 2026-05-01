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
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Load accessibility prefs
  loadAccessibilityPrefs();

  // Init navbar
  initNavbar();

  // Init particles
  initParticles();

  // Init all modules
  ProcessModule.render();
  TimelineModule.init();
  QuizModule.init();
  GlossaryModule.render();
  ChatUI.init();

  // Smooth links
  initSmoothLinks();

  // Reveal animations (initial pass)
  setTimeout(initReveal, 100);

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    // Ctrl+/ or ? to focus chat input
    if ((e.ctrlKey && e.key === '/') || (e.key === '?' && !e.target.matches('input, textarea'))) {
      e.preventDefault();
      scrollToSection('assistant');
      setTimeout(() => document.getElementById('chatInput')?.focus(), 500);
    }
    // Esc to close mobile menu
    if (e.key === 'Escape') closeMobileMenu();
  });

  console.info('🗳️ ElectIQ loaded. Powered by Google Gemini. Built for PromptWars Virtual.');
});

// Expose globals needed by inline HTML handlers
window.scrollToSection = scrollToSection;
window.showToast = showToast;
window.closeMobileMenu = closeMobileMenu;
window.toggleHighContrast = toggleHighContrast;
window.increaseFontSize = increaseFontSize;
window.resetAccessibility = resetAccessibility;
window.copyMessage = (btn) => ChatUI.copyMessage(btn);
