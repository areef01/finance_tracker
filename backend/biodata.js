// =====================================================
//  BACKEND — Biodata Page
//  Flip cards + combined spending stats
// =====================================================

function initBioPage() {
  renderBioCards();
  renderBioStats();
}

// ---- Flip Cards ----
function renderBioCards() {
  const grid = document.getElementById('bioCardsGrid');

  PERSONS.forEach(person => {
    const tagsHTML    = person.tags.map(t => `<span class="card-tag">${t}</span>`).join('');
    const ICON_MAP    = { Birthday:'🎂', Age:'🕯️', Hometown:'📍', Occupation:'💼', Education:'🎓', Hobby:'🎯', Pet:'🐾', 'Fav Food':'🍴', Dream:'🌟', Weakness:'😅' };
    const bioRowsHTML = Object.entries(person.bio).map(([key, val]) => `
      <div class="bio-row">
        <span class="bio-icon">${ICON_MAP[key] || '•'}</span>
        <span class="bio-key">${key}</span>
        <span class="bio-val">${val}</span>
      </div>
    `).join('');

    grid.insertAdjacentHTML('beforeend', `
      <div class="flip-card ${person.theme}" id="card-${person.id}">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <div class="card-front-bg"></div>
            <div class="card-avatar-wrapper">
              <div class="card-avatar">${person.emoji}</div>
            </div>
            <div class="card-name">${person.name}</div>
            <div class="card-role">${person.role}</div>
            <div class="card-tags">${tagsHTML}</div>
            <div class="card-front-footer"><span>🔄</span> Click to see biodata</div>
          </div>
          <div class="flip-card-back">
            <div class="card-back-header">
              <div class="card-back-avatar">${person.emoji}</div>
              <div>
                <div class="card-back-name">${person.name}</div>
                <div class="card-back-role">${person.role}</div>
              </div>
            </div>
            <div class="bio-list">${bioRowsHTML}</div>
            <div class="card-back-quote">${person.quote}</div>
          </div>
        </div>
        <div class="flip-card-hint">🔄 Click card to flip</div>
      </div>
    `);

    document.getElementById(`card-${person.id}`).addEventListener('click', function () {
      this.classList.toggle('flipped');
      this.querySelector('.flip-card-hint').innerHTML =
        this.classList.contains('flipped') ? '🔄 Click to flip back' : '🔄 Click card to flip';
    });
  });
}

// ---- Combined Stats ----
function renderBioStats() {
  const total6m    = EXPENSES.reduce((s,e) => s+e.amount, 0);
  const avgMonth   = total6m / 6;
  const savings6m  = EXPENSES.filter(e=>e.category==='Savings').reduce((s,e)=>s+e.amount,0);
  const catTotals  = {};
  EXPENSES.filter(e=>e.category!=='Savings').forEach(e => catTotals[e.category]=(catTotals[e.category]||0)+e.amount);
  const topCat     = Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0][0];
  const monthTot   = {};
  EXPENSES.forEach(e => monthTot[e.month]=(monthTot[e.month]||0)+e.amount);
  const topMonth   = Object.entries(monthTot).sort((a,b)=>b[1]-a[1])[0][0];
  const sarahTotal = EXPENSES.filter(e=>e.person==='Sarah').reduce((s,e)=>s+e.amount,0);
  const alexTotal  = EXPENSES.filter(e=>e.person==='Alex').reduce((s,e)=>s+e.amount,0);
  const fmt        = v => `RM ${v.toLocaleString('en-MY',{minimumFractionDigits:0,maximumFractionDigits:0})}`;

  const stats = [
    { emoji:'💸', value:fmt(total6m),   label:'Total 6-Month Spend' },
    { emoji:'📊', value:fmt(avgMonth),  label:'Average Monthly Spend' },
    { emoji:'🏆', value:EXPENSES.length, label:'Total Transactions' },
    { emoji:'🍜', value:topCat,         label:'Top Spending Category' },
    { emoji:'💰', value:fmt(savings6m), label:'Total Savings (6 months)' },
    { emoji:'🔥', value:topMonth,       label:'Biggest Spending Month' },
    { emoji:'👩', value:fmt(sarahTotal),label:"Sarah's Total Spend" },
    { emoji:'👨', value:fmt(alexTotal), label:"Alex's Total Spend" },
  ];

  const grid = document.getElementById('bioStatsGrid');
  stats.forEach(s => {
    grid.insertAdjacentHTML('beforeend', `
      <div class="bio-stat-card">
        <span class="bio-stat-emoji">${s.emoji}</span>
        <div class="bio-stat-value">${s.value}</div>
        <div class="bio-stat-label">${s.label}</div>
      </div>
    `);
  });
}
