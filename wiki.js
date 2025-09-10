if (localStorage.getItem('rp_authed') !== '1') {
  location.href = "index.html";
}

const resultsEl = document.getElementById('results');
const searchEl = document.getElementById('searchInput');
const suggestionsEl = document.getElementById('searchSuggestions');
const filterButtons = document.querySelectorAll('.filters button');
const timelineEl = document.getElementById('timeline');
const chronoBtn = document.getElementById('toggleChrono');
const footer = document.querySelector("footer");

let activeCategory = "All";
let lastRenderedIds = [];
let isChronoActive = false;

function renderCard(p) {
  const card = document.createElement('a');
  card.href = p.url;
  card.className = "card";
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${p.title}, ${p.category}`);
  card.innerHTML = `<h3>${p.title}</h3><p>${p.category} — ${p.desc}</p>`;
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter') card.click();
  });
  return card;
}

function renderTimelineItem(item) {
  const wrapper = document.createElement('div');
  wrapper.className = "timeline-item";
  wrapper.setAttribute('tabindex', '0');
  wrapper.setAttribute('role', 'button');
  wrapper.setAttribute('aria-expanded', 'false');
  wrapper.textContent = item.date;

  const content = document.createElement('div');
  content.className = "timeline-content";
  content.textContent = item.desc || "Aucun détail disponible.";
  content.style.display = "none";

  const toggle = () => {
    const isHidden = content.style.display === "none";
    content.style.display = isHidden ? "block" : "none";
    wrapper.setAttribute('aria-expanded', String(isHidden));
  };

  wrapper.addEventListener('click', toggle);
  wrapper.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
    if (e.key === 'Escape') {
      content.style.display = "none";
      wrapper.setAttribute('aria-expanded', 'false');
    }
  });

  return [wrapper, content];
}

function renderResults(list) {
  if (isChronoActive) return;

  const ids = list.map(p => p.url);
  const isSameList = JSON.stringify(ids) === JSON.stringify(lastRenderedIds);
  if (isSameList) return;

  lastRenderedIds = ids;
  resultsEl.innerHTML = "";

  list.forEach(p => {
    const card = renderCard(p);
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = '';
    resultsEl.appendChild(card);
  });

  resultsEl.setAttribute('aria-busy', 'false');
}

function matchesCategory(p) {
  return (
    activeCategory === "All" ||
    p.category === activeCategory ||
    (activeCategory === "Lieux" && p.category === "Continent")
  );
}

function filterResults(query) {
  if (isChronoActive) return;

  const q = (query || "").toLowerCase();
  const filtered = WIKI_PAGES.filter(p =>
    matchesCategory(p) && (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    )
  );
  renderResults(filtered);
}

chronoBtn.addEventListener('click', () => {
  isChronoActive = true;
  clearActiveFilter();
  searchEl.value = "";
  resultsEl.innerHTML = "";
  chronoBtn.classList.add('active');
  chronoBtn.setAttribute('aria-pressed', 'true');
  timelineEl.innerHTML = "";

  setTimeout(() => {
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
  }, 50);

  lastRenderedIds = [];
});

function clearActiveFilter() {
  filterButtons.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  chronoBtn.classList.remove('active');
  chronoBtn.setAttribute('aria-pressed', 'false');
}

function logout() {
  localStorage.clear();
  location.href = "index.html";
}

if (!isChronoActive) {
  renderResults(WIKI_PAGES);
}