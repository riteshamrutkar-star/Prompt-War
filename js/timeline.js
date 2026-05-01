/**
 * ElectIQ – Timeline Module
 */
'use strict';

const TimelineModule = (() => {
  function createItem(item, index) {
    const div = document.createElement('div');
    div.className = 'timeline-item reveal';
    div.setAttribute('role', 'listitem');
    div.style.animationDelay = `${index * 0.08}s`;

    div.innerHTML = `
      <div class="timeline-dot" aria-hidden="true">${item.icon}</div>
      <div class="timeline-content">
        <div class="timeline-date">${item.date}</div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="timeline-tags" aria-label="Tags">
          ${item.tags.map(t => `<span class="timeline-tag">${t}</span>`).join('')}
        </div>
      </div>
    `;
    return div;
  }

  function render(type) {
    const container = document.getElementById('timelineContainer');
    if (!container) return;
    container.innerHTML = '';
    const items = ELECTION_DATA.timelines[type] || ELECTION_DATA.timelines.general;
    items.forEach((item, i) => container.appendChild(createItem(item, i)));
    // Re-observe new items
    observeElements(container.querySelectorAll('.reveal'));
  }

  function init() {
    render('general');

    document.querySelectorAll('.timeline-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.timeline-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        render(btn.getAttribute('data-type'));
      });
    });
  }

  return { init, render };
})();

window.TimelineModule = TimelineModule;
