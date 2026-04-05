// =====================================================
//  BACKEND — Expense Page
//  Charts, table, filters, CSV download
// =====================================================

let monthlyChartInst  = null;
let categoryChartInst = null;

function initExpensePage() {
  populateFilters();
  renderExpensesAll();
  renderCategoryLegend();

  document.getElementById('filterMonth').addEventListener('change',    renderExpensesAll);
  document.getElementById('filterCategory').addEventListener('change', renderExpensesAll);
  document.getElementById('filterPerson').addEventListener('change',   renderExpensesAll);
  document.getElementById('downloadBtn').addEventListener('click',     downloadCSV);
}

// ---- Helpers ----
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

// ---- Render All ----
function renderExpensesAll() {
  const data = getFiltered();
  renderSummary(data);
  renderMonthlyChart(data);
  renderCategoryChart(data);
  renderTable(data);
}

// ---- Summary Cards ----
function renderSummary(data) {
  const total   = data.reduce((s, e) => s + e.amount, 0);
  const savings = data.filter(e => e.category === 'Savings').reduce((s,e) => s+e.amount, 0);
  const spend   = total - savings;

  const catTotals = {};
  data.filter(e => e.category !== 'Savings').forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const topCat = Object.entries(catTotals).sort((a,b) => b[1]-a[1])[0];

  const fmt = v => `RM ${v.toLocaleString('en-MY', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

  document.getElementById('totalAmount').textContent   = fmt(total);
  document.getElementById('spendAmount').textContent   = fmt(spend);
  document.getElementById('savingsAmount').textContent = fmt(savings);
  document.getElementById('topCategory').textContent   = topCat ? topCat[0] : '—';
  document.getElementById('sarahAmount').textContent   = fmt(data.filter(e=>e.person==='Sarah').reduce((s,e)=>s+e.amount,0));
  document.getElementById('alexAmount').textContent    = fmt(data.filter(e=>e.person==='Alex').reduce((s,e)=>s+e.amount,0));
  document.getElementById('txCount').textContent       = `${data.length} transactions`;
}

// ---- Monthly Bar Chart ----
function renderMonthlyChart(data) {
  const months   = [...new Set(EXPENSES.map(e => e.month))];
  const savings  = months.map(m => data.filter(e=>e.month===m && e.category==='Savings').reduce((s,e)=>s+e.amount,0));
  const spending = months.map(m => {
    const total = data.filter(e=>e.month===m).reduce((s,e)=>s+e.amount,0);
    const sav   = data.filter(e=>e.month===m && e.category==='Savings').reduce((s,e)=>s+e.amount,0);
    return total - sav;
  });

  const ctx = document.getElementById('monthlyChart').getContext('2d');
  if (monthlyChartInst) monthlyChartInst.destroy();
  monthlyChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label:'Spending', data:spending, backgroundColor:'rgba(200,121,65,0.75)', borderColor:'rgba(200,121,65,1)',   borderWidth:2, borderRadius:8, borderSkipped:false },
        { label:'Savings',  data:savings,  backgroundColor:'rgba(106,185,138,0.75)', borderColor:'rgba(106,185,138,1)', borderWidth:2, borderRadius:8, borderSkipped:false },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { font:{ family:'Nunito', weight:'600', size:12 }, color:'#7a5540' } },
        tooltip: { callbacks: { label: ctx => ` RM ${ctx.parsed.y.toLocaleString('en-MY',{minimumFractionDigits:2})}` } },
      },
      scales: {
        x: { grid:{ display:false }, ticks:{ font:{ family:'Nunito', weight:'600', size:11 }, color:'#b08060' } },
        y: { beginAtZero:true, grid:{ color:'rgba(200,150,100,0.1)' }, ticks:{ font:{ family:'Nunito', size:11 }, color:'#b08060', callback: v => `RM ${v.toLocaleString()}` } },
      },
    },
  });
}

// ---- Category Donut Chart ----
function renderCategoryChart(data) {
  const catTotals = {};
  data.filter(e => e.category !== 'Savings').forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const sorted = Object.entries(catTotals).sort((a,b) => b[1]-a[1]);
  const labels = sorted.map(([k]) => k);
  const values = sorted.map(([,v]) => v);
  const colors = labels.map(l => CATEGORY_CONFIG[l]?.color || '#ccc');

  const ctx = document.getElementById('categoryChart').getContext('2d');
  if (categoryChartInst) categoryChartInst.destroy();
  categoryChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data:values, backgroundColor:colors.map(c=>c+'cc'), borderColor:colors, borderWidth:2, hoverOffset:8 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position:'right', labels:{ font:{ family:'Nunito', weight:'600', size:11 }, color:'#7a5540', boxWidth:12, padding:10 } },
        tooltip: { callbacks: { label: ctx => { const t=ctx.dataset.data.reduce((a,b)=>a+b,0); return ` RM ${ctx.parsed.toLocaleString('en-MY',{minimumFractionDigits:2})} (${((ctx.parsed/t)*100).toFixed(1)}%)`; } } },
      },
    },
  });
}

// ---- Category Legend ----
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

// ---- Transactions Table ----
function renderTable(data) {
  const tbody = document.getElementById('expenseTableBody');
  document.getElementById('tableCount').textContent = `${data.length} records`;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-light);font-weight:600;">No transactions found 🔍</td></tr>`;
    return;
  }

  tbody.innerHTML = [...data]
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .map(e => {
      const cfg  = CATEGORY_CONFIG[e.category] || { icon:'💸', color:'#999', bg:'#eee' };
      const date = new Date(e.date).toLocaleDateString('en-MY', { day:'numeric', month:'short', year:'numeric' });
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

// ---- CSV Download ----
function downloadCSV() {
  const headers = ['Date','Category','Subcategory','Description','Amount (RM)','Person','Payment Method','Month'];
  const rows    = EXPENSES.map(e => [e.date, e.category, e.sub, `"${e.desc}"`, e.amount.toFixed(2), e.person, e.payment, e.month]);
  const csv     = [headers, ...rows].map(r => r.join(',')).join('\n');
  const a       = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv],{type:'text/csv'})), download:'expenses_finance_tracker.csv' });
  a.click();
}
