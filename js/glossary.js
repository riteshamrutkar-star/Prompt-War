/**
 * ElectIQ – Glossary Module
 */
'use strict';

const GlossaryModule = (() => {
  function render() {
    const grid = document.getElementById('glossaryGrid');
    if (!grid) return;

    ELECTION_DATA.glossary.forEach(item => {
      const div = document.createElement('div');
      div.className = 'glossary-item reveal';
      div.setAttribute('role', 'listitem');
      div.innerHTML = `
        <div class="glossary-term">${item.term}</div>
        <div class="glossary-def">${item.definition}</div>
      `;
      grid.appendChild(div);
    });

    // Search
    const searchInput = document.getElementById('glossarySearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase().trim();
        document.querySelectorAll('.glossary-item').forEach(item => {
          const term = item.querySelector('.glossary-term').textContent.toLowerCase();
          const def = item.querySelector('.glossary-def').textContent.toLowerCase();
          item.hidden = q && !term.includes(q) && !def.includes(q);
        });
        const lr = document.getElementById('liveRegion');
        const visible = document.querySelectorAll('.glossary-item:not([hidden])').length;
        if (lr) lr.textContent = `${visible} term${visible !== 1 ? 's' : ''} found`;
      });
    }
  }

  return { render };
})();

window.GlossaryModule = GlossaryModule;
