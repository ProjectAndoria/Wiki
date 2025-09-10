document.addEventListener('DOMContentLoaded', () => {
  // Gestion du clic classique sur les filtres
  filterButtons.forEach(btn => {
    btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
    btn.addEventListener('click', () => {
      console.log("🔁 Clic sur filtre :", btn.getAttribute('data-filter'));
      isChronoActive = false;
      const filter = btn.getAttribute('data-filter');
      activeCategory = filter;
      searchEl.value = "";
      closeSuggestions();
      clearActiveFilter();
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      timelineEl.style.display = "none";

      let filtered;
      if (filter === "All") {
        filtered = WIKI_PAGES;
      } else if (filter === "Lieux") {
        filtered = WIKI_PAGES.filter(p => p.category === "Continent");
      } else {
        filtered = WIKI_PAGES.filter(p => p.category === filter);
      }

      console.log("📦 Résultats filtrés :", filtered.length);
      renderResults(filtered);
    });
  });

  // Gestion du clic + glisser pour changer de filtre ou activer la chronologie
  const filtersBar = document.querySelector('.filters');
  let isDraggingFilter = false;

  filtersBar.addEventListener('mousedown', e => {
    if (e.button === 0) {
      isDraggingFilter = true;
      console.log("🖱️ Drag commencé");
      triggerFilterAt(e.clientX);
    }
  });

  document.addEventListener('mousemove', e => {
    if (isDraggingFilter) {
      triggerFilterAt(e.clientX);
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDraggingFilter) console.log("🖱️ Drag terminé");
    isDraggingFilter = false;
  });

  function triggerFilterAt(x) {
    [...filterButtons, chronoBtn].forEach(btn => {
      const rect = btn.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right) {
        if (!btn.classList.contains('active')) {
          if (btn === chronoBtn) {
            console.log("🕒 Activation de la chronologie");
            isChronoActive = true;
            clearActiveFilter();
            searchEl.value = "";
            closeSuggestions();
            resultsEl.innerHTML = "";
            chronoBtn.classList.add('active');
            chronoBtn.setAttribute('aria-pressed', 'true');
            timelineEl.innerHTML = "";
            timelineEl.style.display = "flex";

            timelineData.forEach(item => {
              const [wrapper, content] = renderTimelineItem(item);
              wrapper.style.animation = 'none';
              wrapper.offsetHeight;
              wrapper.style.animation = '';
              content.style.animation = 'none';
              content.offsetHeight;
              content.style.animation = '';
              timelineEl.appendChild(wrapper);
              timelineEl.appendChild(content);
            });

            console.log("📅 Chronologie affichée :", timelineData.length, "éléments");
          } else {
            console.log("🔁 Drag vers filtre :", btn.getAttribute('data-filter'));
            isChronoActive = false;
            btn.click();
          }
        }
      }
    });
  }
});