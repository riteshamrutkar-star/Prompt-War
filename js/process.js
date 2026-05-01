/**
 * ElectIQ – Process Steps Module
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

    card.innerHTML = `
      <div class="process-card-number" aria-hidden="true">0${step.id}</div>
      <span class="process-card-icon" aria-hidden="true">${step.icon}</span>
      <h3>${step.title}</h3>
      <p>${step.description}</p>
      <span class="process-tag ${step.category}" aria-label="Category: ${step.categoryLabel}">${step.categoryLabel}</span>
      <ul class="process-details" aria-label="Key details" style="display:none;margin-top:.75rem;padding-left:1.2rem;">
        ${step.details.map(d => `<li style="font-size:.82rem;color:var(--text-muted);margin-bottom:.25rem;">${d}</li>`).join('')}
      </ul>
    `;

    // Toggle details on click/keypress
    card.addEventListener('click', () => toggleDetails(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDetails(card); }
    });

    return card;
  }

  function toggleDetails(card) {
    const details = card.querySelector('.process-details');
    const isHidden = details.style.display === 'none';
    details.style.display = isHidden ? 'block' : 'none';
    card.setAttribute('aria-expanded', String(isHidden));
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
