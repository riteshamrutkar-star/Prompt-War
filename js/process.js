/**
 * ElectIQ – Process Steps Module
 * Shows election step cards with expandable details + Ask AI integration
 */
'use strict';

const ProcessModule = (() => {
  function createCard(step) {
    const card = document.createElement('article');
    card.className = 'process-card reveal';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-category', step.category);
    card.setAttribute('aria-label', `Step ${step.id}: ${step.title}`);
    card.setAttribute('aria-expanded', 'false');

    card.innerHTML = `
      <div class="process-card-number" aria-hidden="true">0${step.id}</div>
      <span class="process-card-icon" aria-hidden="true">${step.icon}</span>
      <h3>${step.title}</h3>
      <p>${step.description}</p>
      <span class="process-tag ${step.category}" aria-label="Category: ${step.categoryLabel}">${step.categoryLabel}</span>

      <div class="process-details-block" hidden>
        <ul class="process-details-list" aria-label="Key details for ${step.title}">
          ${step.details.map(d => `<li>${d}</li>`).join('')}
        </ul>
        <button
          class="process-ask-ai-btn"
          data-question="Explain Step ${step.id} of the election process: '${step.title}'. Give me a detailed breakdown with real-world examples."
          aria-label="Ask AI to explain ${step.title}"
        >
          ✨ Ask AI to Explain This Step
        </button>
      </div>

      <button class="process-toggle-btn" aria-label="Show details for ${step.title}" aria-expanded="false">
        <span class="toggle-label">Show Details</span>
        <span class="toggle-chevron" aria-hidden="true">›</span>
      </button>
    `;

    // Toggle details block
    const toggleBtn = card.querySelector('.process-toggle-btn');
    const detailsBlock = card.querySelector('.process-details-block');

    function toggle(e) {
      e.stopPropagation();
      const isOpen = !detailsBlock.hidden;
      detailsBlock.hidden = isOpen;
      card.setAttribute('aria-expanded', String(!isOpen));
      toggleBtn.setAttribute('aria-expanded', String(!isOpen));
      toggleBtn.querySelector('.toggle-label').textContent = isOpen ? 'Show Details' : 'Hide Details';
      toggleBtn.querySelector('.toggle-chevron').style.transform = isOpen ? '' : 'rotate(90deg)';
    }

    toggleBtn.addEventListener('click', toggle);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); }
    });

    // Ask AI button
    const askAiBtn = card.querySelector('.process-ask-ai-btn');
    askAiBtn.addEventListener('click', e => {
      e.stopPropagation();
      const question = askAiBtn.getAttribute('data-question');
      scrollToSection('assistant');
      setTimeout(() => {
        ChatUI.sendMessage(question);
      }, 600);
    });

    return card;
  }

  function render() {
    const grid = document.getElementById('processGrid');
    if (!grid) return;

    ELECTION_DATA.processSteps.forEach(step => {
      grid.appendChild(createCard(step));
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        const filter = btn.getAttribute('data-filter');
        grid.querySelectorAll('.process-card').forEach(card => {
          const show = filter === 'all' || card.getAttribute('data-category') === filter;
          card.hidden = !show;
        });
        announceFilter(filter);
      });
    });
  }

  function announceFilter(filter) {
    const lr = document.getElementById('liveRegion');
    if (lr) lr.textContent = filter === 'all' ? 'Showing all steps' : `Filtered to ${filter}-election steps`;
  }

  return { render };
})();

window.ProcessModule = ProcessModule;
