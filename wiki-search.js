let suggOpen = false;
let suggIndex = -1;
let suggItems = [];

function openSuggestions() {
  if (!suggOpen) {
    suggestionsEl.classList.add('open');
    searchEl.setAttribute('aria-expanded', 'true');
    suggOpen = true;
  }
}

function closeSuggestions() {
  if (suggOpen) {
    suggestionsEl.classList.remove('open');
    searchEl.setAttribute('aria-expanded', 'false');
    suggOpen = false;
    suggIndex = -1;
    suggItems = [];
  }
}

function highlight(str, q) {
  if (!q) return str;
  const i = str.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return str;
  const end = i + q.length;
  return `${str.slice(0, i)}<strong>${str.slice(i, end)}</strong>${str.slice(end)}`;
}

function buildSuggestions(query) {
  const q = (query || "").trim().toLowerCase();
  console.log("🔤 Build suggestions pour :", q);
  suggestionsEl.innerHTML = "";
  suggIndex = -1;
  suggItems = [];

  if (!q) {
    closeSuggestions();
    return;
  }

  const pool = WIKI_PAGES.filter(p => matchesCategory(p));
  const byTitle = [], byCategory = [], byDesc = [];

  pool.forEach(p => {
    const t = p.title.toLowerCase();
    const c = p.category.toLowerCase();
    const d = p.desc.toLowerCase();
    if (t.includes(q)) byTitle.push({ p });
    else if (c.includes(q)) byCategory.push({ p });
    else if (d.includes(q)) byDesc.push({ p });
  });

  const merged = [...byTitle, ...byCategory, ...byDesc].slice(0, 8);
  console.log("📦 Suggestions trouvées :", merged.length);

  if (merged.length === 0) {
    const li = document.createElement('li');
    li.className = "muted";
    li.textContent = "Aucune suggestion";
    li.setAttribute('role', 'option');
    li.setAttribute('aria-disabled', 'true');
    suggestionsEl.appendChild(li);
    openSuggestions();
    return;
  }

  merged.forEach(({ p }, idx) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('id', `sugg-${idx}`);
    li.dataset.url = p.url;
    li.dataset.title = p.title;

    const label = `${p.title} — ${p.category}`;
    li.innerHTML = label.replace(p.title, m => highlight(m, query));

    li.addEventListener('mousedown', e => {
      e.preventDefault();
      applySuggestion(li);
    });

    suggestionsEl.appendChild(li);
    suggItems.push(li);
  });

  openSuggestions();
  searchEl.setAttribute('aria-activedescendant', '');
}

function moveSuggestionFocus(delta) {
  if (!suggOpen || suggItems.length === 0) return;
  suggIndex = (suggIndex + delta + suggItems.length) % suggItems.length;
  suggItems.forEach((li, i) => {
    li.setAttribute('aria-selected', i === suggIndex ? 'true' : 'false');
  });
  const active = suggItems[suggIndex];
  searchEl.setAttribute('aria-activedescendant', active.id);
  const { offsetTop, offsetHeight } = active;
  const viewTop = suggestionsEl.scrollTop;
  const viewBottom = viewTop + suggestionsEl.clientHeight;
  if (offsetTop < viewTop) suggestionsEl.scrollTop = offsetTop;
  else if (offsetTop + offsetHeight > viewBottom) suggestionsEl.scrollTop = offsetTop - suggestionsEl.clientHeight + offsetHeight;
}

function applySuggestion(li) {
  const title = li.dataset.title;
  console.log("✅ Suggestion appliquée :", title);
  searchEl.value = title;
  filterResults(title);
  closeSuggestions();
}

let debounceT;

searchEl.addEventListener('input', () => {
  if (isChronoActive) {
    console.log("⛔ Recherche ignorée (Chronologie active)");
    return;
  }

  clearTimeout(debounceT);
  resultsEl.setAttribute('aria-busy', 'true');
  const q = searchEl.value;
  console.log("⌨️ Saisie détectée :", q);

  debounceT = setTimeout(() => {
    buildSuggestions(q);
    filterResults(q);
  }, 90);

  clearActiveFilter();
});

searchEl.addEventListener('keydown', e => {
  if (!suggOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    openSuggestions();
    moveSuggestionFocus(1);
    e.preventDefault();
    return;
  }
  switch (e.key) {
    case 'ArrowDown': moveSuggestionFocus(1); e.preventDefault(); break;
    case 'ArrowUp': moveSuggestionFocus(-1); e.preventDefault(); break;
    case 'Enter':
      if (suggOpen && suggIndex >= 0) {
        e.preventDefault();
        applySuggestion(suggItems[suggIndex]);
      }
      break;
    case 'Escape': closeSuggestions(); break;
  }
});

searchEl.addEventListener('blur', () => {
  setTimeout(() => closeSuggestions(), 100);
});