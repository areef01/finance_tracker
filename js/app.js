// =====================================================
//  Finance Tracker — Main App Logic
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initExpensePage();
  initBioPage();
});

// =====================================================
//  NAVIGATION
// =====================================================
function initNavigation() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const pages   = document.querySelectorAll('.page');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.page;
      tabBtns.forEach(b => b.classList.remove('active'));
      pages.forEach(p  => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
}

// =====================================================
//  EXPENSES PAGE
// =====================================================
let monthlyChartInst = null;
let categoryChartInst = null;
let personChartInst = null;

function initExpensePage() {
  populateFilters();
  renderAll();

  document.getElementById('filterMonth').addEventListener('change', renderAll);
  document.getElementById('filterCategory').addEventListener('change', renderAll);
  document.getElementById('filterPerson').addEventListener('change', renderAll);
  document.getElementById('downloadBtn').addEventListener('click', downloadCSV);
}

function getFiltered() {
  const month    = document.getElementById('filterMonth').value;
  const category = document.getElementById('filterCategory').value;
  const person   = document.getElementById('filterPerson').value;

  return EXPENSES.filter(e => {
    if (month    && e.month    !== month)    return false;
    if (category && e.category !== category) return false;
    if (person   && e.person   !== person)   return false;
    return true;
  });
}

function renderAll() {
  const data = getFiltered();
  renderSummary(data);
  renderMonthlyChart(data);
  renderCategoryChart(data);
  renderPersonChart(data);
  renderTable(data);
}

function populateFilters() {
  // Months
  const months    = [...new Set(EXPENSES.map(e => e.month))];
  const monthSel  = document.getElementById('filterMonth');
  months.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m;
    monthSel.appendChild(opt);
  });

  // Categories
  const cats    = [...new Set(EXPENSES.map(e => e.category))].sort();
  const catSel  = document.getElementById('filterCategory');
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    catSel.appendChild(opt);
  });
}

// ---- Summary Cards ----
function renderSummary(data) {
  const total   = data.reduce((s, e) => s + e.amount, 0);
  const savings = data.filter(e => e.category === 'Savings').reduce((s,e) => s+e.amount, 0);
  const spend   = total - savings;

  // Most spent category (excluding savings)
  const catTotals = {};
  data.filter(e => e.category !== 'Savings').forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const topCat = Object.entries(catTotals).sort((a,b) => b[1]-a[1])[0];

  // Per person
  const sarahTotal = data.filter(e=>e.person==='Sarah').reduce((s,e)=>s+e.amount,0);
  const alexTotal  = data.filter(e=>e.person==='Alex').reduce((s,e)=>s+e.amount,0);

  document.getElementById('totalAmount').textContent  = `RM ${total.toLocaleString('en-MY', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  document.getElementById('spendAmount').textContent  = `RM ${spend.toLocaleString('en-MY', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  document.getElementById('savingsAmount').textContent= `RM ${savings.toLocaleString('en-MY', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  document.getElementById('topCategory').textContent  = topCat ? topCat[0] : '—';
  document.getElementById('sarahAmount').textContent  = `RM ${sarahTotal.toLocaleString('en-MY', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  document.getElementById('alexAmount').textContent   = `RM ${alexTotal.toLocaleString('en-MY', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  document.getElementById('txCount').textContent      = `${data.length} transactions`;
}

// ---- Monthly Chart ----
function renderMonthlyChart(data) {
  const months    = [...new Set(EXPENSES.map(e => e.month))];
  const totals    = months.map(m => data.filter(e=>e.month===m).reduce((s,e)=>s+e.amount,0));
  const savings   = months.map(m => data.filter(e=>e.month===m && e.category==='Savings').reduce((s,e)=>s+e.amount,0));
  const spending  = totals.map((t,i) => t - savings[i]);

  const ctx = document.getElementById('monthlyChart').getContext('2d');
  if (monthlyChartInst) monthlyChartInst.destroy();
  monthlyChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Spending',
          data: spending,
          backgroundColor: 'rgba(200,121,65,0.75)',
          borderColor: 'rgba(200,121,65,1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Savings',
          data: savings,
          backgroundColor: 'rgba(106,185,138,0.75)',
          borderColor: 'rgba(106,185,138,1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { font: { family: 'Nunito', weight: '600', size: 12 }, color: '#7a5540' }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` RM ${ctx.parsed.y.toLocaleString('en-MY', {minimumFractionDigits:2})}`
          }
        }
      },
      scales: {
        x: {
          stacked: false,
          grid: { display: false },
          ticks: { font: { family: 'Nunito', weight: '600', size: 11 }, color: '#b08060' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(200,150,100,0.1)' },
          ticks: {
            font: { family: 'Nunito', size: 11 },
            color: '#b08060',
            callback: v => `RM ${v.toLocaleString()}`
          }
        }
      }
    }
  });
}

// ---- Category Donut Chart ----
function renderCategoryChart(data) {
  const catTotals = {};
  data.filter(e => e.category !== 'Savings').forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  const sorted  = Object.entries(catTotals).sort((a,b) => b[1]-a[1]);
  const labels  = sorted.map(([k]) => k);
  const values  = sorted.map(([,v]) => v);
  const colors  = labels.map(l => CATEGORY_CONFIG[l]?.color || '#ccc');

  const ctx = document.getElementById('categoryChart').getContext('2d');
  if (categoryChartInst) categoryChartInst.destroy();
  categoryChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.map(c => c + 'cc'),
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: { family: 'Nunito', weight: '600', size: 11 },
            color: '#7a5540',
            boxWidth: 12,
            padding: 10,
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed;
              const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
              const pct = ((val/total)*100).toFixed(1);
              return ` RM ${val.toLocaleString('en-MY', {minimumFractionDigits:2})} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// ---- Person Pie Chart ----
function renderPersonChart(data) {
  const sarah = data.filter(e=>e.person==='Sarah').reduce((s,e)=>s+e.amount,0);
  const alex  = data.filter(e=>e.person==='Alex').reduce((s,e)=>s+e.amount,0);

  const ctx = document.getElementById('personChart').getContext('2d');
  if (personChartInst) personChartInst.destroy();
  personChartInst = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Sarah', 'Alex'],
      datasets: [{
        data: [sarah, alex],
        backgroundColor: ['rgba(232,160,176,0.8)', 'rgba(122,181,160,0.8)'],
        borderColor: ['#e8a0b0', '#7ab5a0'],
        borderWidth: 3,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { font: { family: 'Nunito', weight: '700', size: 13 }, color: '#7a5540', boxWidth: 14 }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const val = ctx.parsed;
              const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
              const pct = ((val/total)*100).toFixed(1);
              return ` RM ${val.toLocaleString('en-MY', {minimumFractionDigits:2})} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// ---- Transactions Table ----
function renderTable(data) {
  const tbody = document.getElementById('expenseTableBody');
  const count = document.getElementById('tableCount');
  count.textContent = `${data.length} records`;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-light);font-weight:600;">No transactions found 🔍</td></tr>`;
    return;
  }

  const sorted = [...data].sort((a,b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = sorted.map(e => {
    const cfg  = CATEGORY_CONFIG[e.category] || { icon:'💸', color:'#999', bg:'#eee' };
    const date = new Date(e.date);
    const dateStr = date.toLocaleDateString('en-MY', { day:'numeric', month:'short', year:'numeric' });
    const personClass = e.person.toLowerCase();
    return `
      <tr>
        <td style="color:var(--text-light);font-size:0.82rem;white-space:nowrap;">${dateStr}</td>
        <td>
          <span class="category-pill" style="background:${cfg.bg};color:${cfg.color};border:1.5px solid ${cfg.color}33;">
            ${cfg.icon} ${e.category}
          </span>
        </td>
        <td style="font-size:0.82rem;color:var(--text-medium);">${e.sub}</td>
        <td style="font-weight:600;color:var(--text-dark);">${e.desc}</td>
        <td class="amount-cell">RM ${e.amount.toFixed(2)}</td>
        <td><span class="person-badge ${personClass}">${e.person === 'Sarah' ? '👩' : '👨'} ${e.person}</span></td>
        <td><span class="payment-tag">${e.payment}</span></td>
      </tr>
    `;
  }).join('');
}

// ---- CSV Download ----
function downloadCSV() {
  const headers = ['Date','Category','Subcategory','Description','Amount (RM)','Person','Payment Method','Month'];
  const rows = EXPENSES.map(e => [
    e.date, e.category, e.sub, `"${e.desc}"`, e.amount.toFixed(2), e.person, e.payment, e.month
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'expenses_finance_tracker.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// =====================================================
//  BIODATA PAGE
// =====================================================
function initBioPage() {
  renderBioCards();
  renderBioStats();
}

function renderBioCards() {
  const grid = document.getElementById('bioCardsGrid');

  PERSONS.forEach(person => {
    const tagsHTML = person.tags.map(t => `<span class="card-tag">${t}</span>`).join('');

    const bioRowsHTML = Object.entries(person.bio).map(([key, val]) => {
      const iconMap = {
        'Birthday': '🎂', 'Age': '🕯️', 'Hometown': '📍', 'Occupation': '💼',
        'Education': '🎓', 'Hobby': '🎯', 'Pet': '🐾', 'Fav Food': '🍴',
        'Dream': '🌟', 'Weakness': '😅',
      };
      return `
        <div class="bio-row">
          <span class="bio-icon">${iconMap[key] || '•'}</span>
          <span class="bio-key">${key}</span>
          <span class="bio-val">${val}</span>
        </div>
      `;
    }).join('');

    const cardHTML = `
      <div class="flip-card ${person.theme}" id="card-${person.id}">
        <div class="flip-card-inner">

          <!-- FRONT -->
          <div class="flip-card-front">
            <div class="card-front-bg"></div>
            <div class="card-avatar-wrapper">
              <div class="card-avatar">${person.emoji}</div>
            </div>
            <div class="card-name">${person.name}</div>
            <div class="card-role">${person.role}</div>
            <div class="card-tags">${tagsHTML}</div>
            <div class="card-front-footer">
              <span>🔄</span> Click to see biodata
            </div>
          </div>

          <!-- BACK -->
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
    `;

    grid.insertAdjacentHTML('beforeend', cardHTML);

    // Attach click listener
    document.getElementById(`card-${person.id}`).addEventListener('click', function() {
      this.classList.toggle('flipped');
      // Update hint text
      const hint = this.querySelector('.flip-card-hint');
      if (this.classList.contains('flipped')) {
        hint.innerHTML = '🔄 Click to flip back';
      } else {
        hint.innerHTML = '🔄 Click card to flip';
      }
    });
  });
}

function renderBioStats() {
  const total6m = EXPENSES.reduce((s,e)=>s+e.amount,0);
  const avgMonth = total6m / 6;
  const totalTx  = EXPENSES.length;
  const topCat = (() => {
    const t={};
    EXPENSES.filter(e=>e.category!=='Savings').forEach(e=>t[e.category]=(t[e.category]||0)+e.amount);
    return Object.entries(t).sort((a,b)=>b[1]-a[1])[0][0];
  })();
  const savings6m = EXPENSES.filter(e=>e.category==='Savings').reduce((s,e)=>s+e.amount,0);
  const topMonth = (() => {
    const t={};
    EXPENSES.forEach(e=>t[e.month]=(t[e.month]||0)+e.amount);
    return Object.entries(t).sort((a,b)=>b[1]-a[1])[0][0];
  })();
  const sarahTotal = EXPENSES.filter(e=>e.person==='Sarah').reduce((s,e)=>s+e.amount,0);
  const alexTotal  = EXPENSES.filter(e=>e.person==='Alex').reduce((s,e)=>s+e.amount,0);

  const stats = [
    { emoji:'💸', value:`RM ${total6m.toLocaleString('en-MY',{minimumFractionDigits:0,maximumFractionDigits:0})}`, label:'Total 6-Month Spend' },
    { emoji:'📊', value:`RM ${avgMonth.toLocaleString('en-MY',{minimumFractionDigits:0,maximumFractionDigits:0})}`, label:'Average Monthly Spend' },
    { emoji:'🏆', value:totalTx, label:'Total Transactions' },
    { emoji:'🍜', value:topCat.split(' ')[0]+' '+topCat.split(' ')[1], label:'Top Spending Category' },
    { emoji:'💰', value:`RM ${savings6m.toLocaleString('en-MY',{minimumFractionDigits:0,maximumFractionDigits:0})}`, label:'Total Savings (6 months)' },
    { emoji:'🔥', value:topMonth, label:'Biggest Spending Month' },
    { emoji:'👩', value:`RM ${sarahTotal.toLocaleString('en-MY',{minimumFractionDigits:0,maximumFractionDigits:0})}`, label:"Sarah's Total Spend" },
    { emoji:'👨', value:`RM ${alexTotal.toLocaleString('en-MY',{minimumFractionDigits:0,maximumFractionDigits:0})}`, label:"Alex's Total Spend" },
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
