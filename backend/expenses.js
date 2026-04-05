// =====================================================
//  BACKEND — Expense Page
//  Layout-aware: Group | Sarah | Alex
// =====================================================

let monthlyChartInst  = null;
let categoryChartInst = null;
let currentLayout     = 'group'; // 'group' | 'sarah' | 'alex'

// =====================================================
//  INIT
// =====================================================
function initExpensePage() {
  populateFilters();
  renderExpensesAll();

  // Layout switcher
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setLayout(btn.dataset.layout);
    });
  });

  document.getElementById('filterMonth').addEventListener('change',    renderExpensesAll);
  document.getElementById('filterCategory').addEventListener('change', renderExpensesAll);
  document.getElementById('filterPerson').addEventListener('change',   renderExpensesAll);
  document.getElementById('downloadBtn').addEventListener('click',     downloadCSV);
}

// =====================================================
//  LAYOUT MANAGEMENT
// =====================================================
function setLayout(layout) {
  currentLayout = layout;
  const body    = document.body;
  const section = document.getElementById('page-expenses');

  // Remove all layout classes
  body.classList.remove('layout-sarah', 'layout-alex');
  section.classList.remove('theme-sarah', 'theme-alex');

  if (layout === 'sarah') {
    body.classList.add('layout-sarah');
    section.classList.add('theme-sarah');
    document.getElementById('expPageTitle').textContent    = '✨ Sarah\'s Expenses';
    document.getElementById('expPageSubtitle').textContent = 'Sarah\'s personal spending — Oct 2025 to Mar 2026';
    document.getElementById('filterPerson').value = 'Sarah';
  } else if (layout === 'alex') {
    body.classList.add('layout-alex');
    section.classList.add('theme-alex');
    document.getElementById('expPageTitle').textContent    = '💎 Alex\'s Dashboard';
    document.getElementById('expPageSubtitle').textContent = 'Alex\'s personal spending — Oct 2025 to Mar 2026';
    document.getElementById('filterPerson').value = 'Alex';
  } else {
    document.getElementById('expPageTitle').textContent    = '💸 Expense Tracker';
    document.getElementById('expPageSubtitle').textContent = 'Tracking Sarah & Alex\'s combined spending — Oct 2025 to Mar 2026';
    document.getElementById('filterPerson').value = '';
  }

  renderExpensesAll();
}

function getLayoutPerson() {
  if (currentLayout === 'sarah') return 'Sarah';
  if (currentLayout === 'alex')  return 'Alex';
  return null;
}

// =====================================================
//  CHART THEMING
// =====================================================
function getChartTheme() {
  if (currentLayout === 'alex') {
    return {
      textColor:    '#c8a84b',
      gridColor:    'rgba(212,175,55,0.08)',
      barPrimary:   { fill:'rgba(212,175,55,0.75)', border:'rgba(212,175,55,1)' },
      barSecondary: { fill:'rgba(80,120,200,0.6)',  border:'rgba(100,140,220,1)' },
      tooltipBg:    '#0d1525',
      tooltipText:  '#d4af37',
    };
  }
  if (currentLayout === 'sarah') {
    return {
      textColor:    '#c0507a',
      gridColor:    'rgba(224,96,128,0.08)',
      barPrimary:   { fill:'rgba(224,96,128,0.75)', border:'rgba(224,96,128,1)' },
      barSecondary: { fill:'rgba(106,185,138,0.75)', border:'rgba(106,185,138,1)' },
      tooltipBg:    '#fff0f5',
      tooltipText:  '#c0507a',
    };
  }
  return {
    textColor:    '#b08060',
    gridColor:    'rgba(200,150,100,0.1)',
    barPrimary:   { fill:'rgba(200,121,65,0.75)', border:'rgba(200,121,65,1)' },
    barSecondary: { fill:'rgba(106,185,138,0.75)', border:'rgba(106,185,138,1)' },
    tooltipBg:    '#fff8f0',
    tooltipText:  '#7a5540',
  };
}

// =====================================================
//  FILTERS
// =====================================================
function getFiltered() {
  const month        = document.getElementById('filterMonth').value;
  const category     = document.getElementById('filterCategory').value;
  const filterPerson = document.getElementById('filterPerson').value;
  const layoutPerson = getLayoutPerson();
  // Layout person takes priority; filter person is secondary
  const activePerson = layoutPerson || filterPerson;

  return EXPENSES.filter(e => {
    if (month        && e.month    !== month)    return false;
    if (category     && e.category !== category) return false;
    if (activePerson && e.person   !== activePerson) return false;
    return true;
  });
}

function populateFilters() {
  const months   = [...new Set(EXPENSES.map(e => e.month))];
  const monthSel = document.getElementById('filterMonth');
  months.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m;
    monthSel.appendChild(opt);
  });

  const cats   = [...new Set(EXPENSES.map(e => e.category))].sort();
  const catSel = document.getElementById('filterCategory');
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    catSel.appendChild(opt);
  });
}

// =====================================================
//  RENDER ALL
// =====================================================
function renderExpensesAll() {
  const data = getFiltered();
  renderSummary(data);
  renderMonthlyChart(data);
  renderCategoryChart(data);
  renderTable(data);
}

// =====================================================
//  SUMMARY CARDS — dynamic per layout
// =====================================================
function renderSummary(data) {
  const grid    = document.getElementById('summaryGrid');
  const total   = data.reduce((s,e) => s+e.amount, 0);
  const savings = data.filter(e=>e.category==='Savings').reduce((s,e)=>s+e.amount,0);
  const spend   = total - savings;
  const txCount = data.length;
  const fmt     = v => `RM ${v.toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  const catTotals = {};
  data.filter(e=>e.category!=='Savings').forEach(e => catTotals[e.category]=(catTotals[e.category]||0)+e.amount);
  const topCat = Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0];

  // Per-person
  const sarahTotal = EXPENSES.filter(e=>e.person==='Sarah').reduce((s,e)=>s+e.amount,0);
  const alexTotal  = EXPENSES.filter(e=>e.person==='Alex').reduce((s,e)=>s+e.amount,0);

  let cards = [];

  if (currentLayout === 'group') {
    const avgMonthly = spend / 6;
    cards = [
      { color:'orange', icon:'💸', label:'Total Outflow',      value:fmt(total),             sub:`${txCount} transactions` },
      { color:'blue',   icon:'🛒', label:'Total Spending',     value:fmt(spend),             sub:'Excl. savings' },
      { color:'green',  icon:'🏦', label:'Total Savings',      value:fmt(savings),           sub:'Emergency fund' },
      { color:'pink',   icon:'🏆', label:'Top Category',       value:topCat?topCat[0]:'—',  sub:'Highest spending', small:true },
      { color:'purple', icon:'📅', label:'Avg Monthly Spend',  value:fmt(avgMonthly),        sub:'Over 6 months' },
      { color:'blue',   icon:'📋', label:'Transactions',       value:txCount,                sub:'All records' },
    ];
  } else if (currentLayout === 'sarah') {
    const sarahSpend   = data.filter(e=>e.category!=='Savings').reduce((s,e)=>s+e.amount,0);
    const sarahSavings = data.filter(e=>e.category==='Savings').reduce((s,e)=>s+e.amount,0);
    const sarahAvg     = sarahSpend / 6;
    cards = [
      { color:'pink',   icon:'👩', label:"Sarah's Total",      value:fmt(sarahTotal),        sub:'All time' },
      { color:'rose',   icon:'🛍️', label:"Sarah's Spending",   value:fmt(sarahSpend),        sub:'Excl. savings' },
      { color:'green',  icon:'💕', label:"Sarah's Savings",    value:fmt(sarahSavings),      sub:'Emergency fund' },
      { color:'pink',   icon:'🏆', label:'Top Category',       value:topCat?topCat[0]:'—',  sub:'Her highest', small:true },
      { color:'rose',   icon:'📅', label:'Avg Monthly',        value:fmt(sarahAvg),          sub:'Over 6 months' },
      { color:'purple', icon:'📋', label:'Transactions',       value:txCount,                sub:'Her records' },
    ];
  } else { // alex
    const alexSpend   = data.filter(e=>e.category!=='Savings').reduce((s,e)=>s+e.amount,0);
    const alexSavings = data.filter(e=>e.category==='Savings').reduce((s,e)=>s+e.amount,0);
    const alexAvg     = alexSpend / 6;
    cards = [
      { color:'gold',   icon:'👨', label:"Alex's Total",       value:fmt(alexTotal),         sub:'All time' },
      { color:'gold',   icon:'💰', label:"Alex's Spending",    value:fmt(alexSpend),         sub:'Excl. savings' },
      { color:'gold',   icon:'🏦', label:"Alex's Savings",     value:fmt(alexSavings),       sub:'Emergency fund' },
      { color:'gold',   icon:'🏆', label:'Top Category',       value:topCat?topCat[0]:'—',  sub:'His highest', small:true },
      { color:'gold',   icon:'📅', label:'Avg Monthly',        value:fmt(alexAvg),           sub:'Over 6 months' },
      { color:'gold',   icon:'📋', label:'Transactions',       value:txCount,                sub:'His records' },
    ];
  }

  grid.innerHTML = cards.map(c => `
    <div class="summary-card ${c.color}">
      <span class="summary-icon">${c.icon}</span>
      <span class="summary-label">${c.label}</span>
      <span class="summary-value${c.small?' summary-value-sm':''}">${c.value}</span>
      <span class="summary-sub">${c.sub}</span>
    </div>
  `).join('');
}

// =====================================================
//  MONTHLY BAR CHART
// =====================================================
function renderMonthlyChart(data) {
  const theme    = getChartTheme();
  const months   = [...new Set(EXPENSES.map(e => e.month))];
  const savings  = months.map(m => data.filter(e=>e.month===m&&e.category==='Savings').reduce((s,e)=>s+e.amount,0));
  const spending = months.map(m => {
    const t = data.filter(e=>e.month===m).reduce((s,e)=>s+e.amount,0);
    const v = data.filter(e=>e.month===m&&e.category==='Savings').reduce((s,e)=>s+e.amount,0);
    return t - v;
  });

  const ctx = document.getElementById('monthlyChart').getContext('2d');
  if (monthlyChartInst) monthlyChartInst.destroy();

  monthlyChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label:'Spending', data:spending, backgroundColor:theme.barPrimary.fill,   borderColor:theme.barPrimary.border,   borderWidth:2, borderRadius:8, borderSkipped:false },
        { label:'Savings',  data:savings,  backgroundColor:theme.barSecondary.fill, borderColor:theme.barSecondary.border, borderWidth:2, borderRadius:8, borderSkipped:false },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { font:{family:'Nunito',weight:'600',size:12}, color:theme.textColor } },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor:  theme.tooltipText,
          borderColor: theme.barPrimary.border,
          borderWidth: 1,
          callbacks: { label: ctx => ` RM ${ctx.parsed.y.toLocaleString('en-MY',{minimumFractionDigits:2})}` },
        },
      },
      scales: {
        x: { grid:{display:false}, ticks:{font:{family:'Nunito',weight:'600',size:11},color:theme.textColor} },
        y: { beginAtZero:true, grid:{color:theme.gridColor}, ticks:{font:{family:'Nunito',size:11},color:theme.textColor,callback:v=>`RM ${v.toLocaleString()}`} },
      },
    },
  });
}

// =====================================================
//  CATEGORY DONUT CHART
// =====================================================
function renderCategoryChart(data) {
  const theme     = getChartTheme();
  const catTotals = {};
  data.filter(e=>e.category!=='Savings').forEach(e => catTotals[e.category]=(catTotals[e.category]||0)+e.amount);
  const sorted = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]);
  const labels = sorted.map(([k])=>k);
  const values = sorted.map(([,v])=>v);
  const colors = labels.map(l => CATEGORY_CONFIG[l]?.color || '#ccc');

  // For Alex theme, tint colors towards gold
  const fillColors = currentLayout === 'alex'
    ? colors.map((_,i) => {
        const gold = ['rgba(212,175,55,0.85)','rgba(180,140,30,0.8)','rgba(160,120,20,0.75)','rgba(200,160,40,0.8)','rgba(140,100,10,0.7)'];
        return gold[i % gold.length];
      })
    : colors.map(c => c+'cc');

  const ctx = document.getElementById('categoryChart').getContext('2d');
  if (categoryChartInst) categoryChartInst.destroy();
  categoryChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data:values, backgroundColor:fillColors, borderColor: currentLayout==='alex' ? '#0d1525' : 'white', borderWidth:2, hoverOffset:8 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position:'right', labels:{font:{family:'Nunito',weight:'600',size:11},color:theme.textColor,boxWidth:12,padding:10} },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipText,
          bodyColor:  theme.tooltipText,
          callbacks: { label: ctx => { const t=ctx.dataset.data.reduce((a,b)=>a+b,0); return ` RM ${ctx.parsed.toLocaleString('en-MY',{minimumFractionDigits:2})} (${((ctx.parsed/t)*100).toFixed(1)}%)`; } },
        },
      },
    },
  });
}

// =====================================================
//  CATEGORY LEGEND (called once on load)
// =====================================================
function renderCategoryLegend() {
  const legend = document.getElementById('categoryLegend');
  if (!legend) return;
  Object.entries(CATEGORY_CONFIG).forEach(([name, cfg]) => {
    legend.insertAdjacentHTML('beforeend', `
      <div class="legend-item">
        <span class="legend-dot" style="background:${cfg.color};"></span>
        ${cfg.icon} ${name}
      </div>
    `);
  });
}

// =====================================================
//  TRANSACTIONS TABLE
// =====================================================
function renderTable(data) {
  const tbody = document.getElementById('expenseTableBody');
  document.getElementById('tableCount').textContent = `${data.length} records`;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-light);font-weight:600;">No transactions found 🔍</td></tr>`;
    return;
  }

  tbody.innerHTML = [...data]
    .sort((a,b) => new Date(b.date)-new Date(a.date))
    .map(e => {
      const cfg  = CATEGORY_CONFIG[e.category] || { icon:'💸', color:'#999', bg:'#eee' };
      const date = new Date(e.date).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'});
      return `
        <tr>
          <td style="color:var(--text-light);font-size:0.82rem;white-space:nowrap;">${date}</td>
          <td><span class="category-pill" style="background:${cfg.bg};color:${cfg.color};border:1.5px solid ${cfg.color}33;">${cfg.icon} ${e.category}</span></td>
          <td style="font-size:0.82rem;color:var(--text-medium);">${e.sub}</td>
          <td style="font-weight:600;color:var(--text-dark);">${e.desc}</td>
          <td class="amount-cell">RM ${e.amount.toFixed(2)}</td>
          <td><span class="person-badge ${e.person.toLowerCase()}">${e.person==='Sarah'?'👩':'👨'} ${e.person}</span></td>
          <td><span class="payment-tag">${e.payment}</span></td>
        </tr>
      `;
    }).join('');
}

// =====================================================
//  CSV DOWNLOAD
// =====================================================
function downloadCSV() {
  const data    = getFiltered();
  const headers = ['Date','Category','Subcategory','Description','Amount (RM)','Person','Payment Method','Month'];
  const rows    = data.map(e => [e.date,e.category,e.sub,`"${e.desc}"`,e.amount.toFixed(2),e.person,e.payment,e.month]);
  const csv     = [headers,...rows].map(r=>r.join(',')).join('\n');
  const a       = Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([csv],{type:'text/csv'})),download:'expenses_finance_tracker.csv'});
  a.click();
}
