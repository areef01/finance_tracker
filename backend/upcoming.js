// =====================================================
//  BACKEND — Upcoming Payments Page
//  Calendar visual + payment stats panel
// =====================================================

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Shared calendar state
let calYear  = TODAY_DEMO.getFullYear();
let calMonth = TODAY_DEMO.getMonth(); // 0-indexed

function initUpcomingPage() {
  calYear  = TODAY_DEMO.getFullYear();
  calMonth = TODAY_DEMO.getMonth();
  renderCalendar();
  renderUpcomingStats();

  document.getElementById('calPrev').addEventListener('click', () => { navigateCalendar(-1); });
  document.getElementById('calNext').addEventListener('click', () => { navigateCalendar(1); });
}

function navigateCalendar(dir) {
  calMonth += dir;
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  if (calMonth > 11) { calMonth = 0;  calYear++; }
  renderCalendar();
  renderUpcomingStats();
}

// =====================================================
//  CALENDAR
// =====================================================
function renderCalendar() {
  const label    = document.getElementById('calMonthLabel');
  const gridEl   = document.getElementById('calGrid');
  const payments = getPaymentsForMonth(calYear, calMonth);

  label.textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;

  // Build day-keyed map
  const byDay = {};
  payments.forEach(p => {
    const d = new Date(p.dueDate).getDate();
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(p);
  });

  // Calendar math
  const firstDay   = new Date(calYear, calMonth, 1).getDay();   // 0=Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevDays   = new Date(calYear, calMonth, 0).getDate();

  let html = '';

  // Day-of-week headers
  DAY_LABELS.forEach(d => { html += `<div class="cal-day-header">${d}</div>`; });

  // Leading empty cells (prev month)
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-cell other-month"><span class="cal-date-num">${prevDays - firstDay + 1 + i}</span></div>`;
  }

  // Current month cells
  const todayDate = TODAY_DEMO.getDate();
  const isCurrentDisplayMonth = (calYear === TODAY_DEMO.getFullYear() && calMonth === TODAY_DEMO.getMonth());

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isCurrentDisplayMonth && day === todayDate;
    const dayPayments = byDay[day] || [];

    let pillsHtml = '';
    dayPayments.slice(0, 2).forEach(p => {
      const cls = getPaymentClass(p);
      pillsHtml += `<span class="cal-pill ${cls}" title="${p.name} — RM ${p.amount.toFixed(2)}">${p.icon} ${p.amount >= 1000 ? (p.amount/1000).toFixed(1)+'k' : p.amount}</span>`;
    });
    if (dayPayments.length > 2) {
      pillsHtml += `<span class="cal-pill normal">+${dayPayments.length - 2}</span>`;
    }

    html += `
      <div class="cal-cell${isToday ? ' today' : ''}">
        <span class="cal-date-num">${day}${isToday ? '<span class="today-dot"></span>' : ''}</span>
        <div class="cal-pills">${pillsHtml}</div>
      </div>
    `;
  }

  // Trailing cells
  const totalCells = firstDay + daysInMonth;
  const trailing   = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= trailing; i++) {
    html += `<div class="cal-cell other-month"><span class="cal-date-num">${i}</span></div>`;
  }

  gridEl.innerHTML = html;

  // Alarm list
  renderAlarmList(payments);
}

function renderAlarmList(payments) {
  const listEl = document.getElementById('alarmList');
  const alarms = payments.filter(p => p.status !== 'paid' && getDaysUntil(p.dueDate) <= ALARM_DAYS && getDaysUntil(p.dueDate) >= 0);

  if (alarms.length === 0) {
    listEl.innerHTML = `<div class="alarm-empty">✅ No urgent payments right now!</div>`;
    return;
  }

  listEl.innerHTML = alarms.map(p => {
    const days = getDaysUntil(p.dueDate);
    const label = days === 0 ? 'Today!' : days === 1 ? 'Tomorrow!' : `${days} days left`;
    return `
      <div class="alarm-item">
        <span class="alarm-icon">${p.icon}</span>
        <div class="alarm-info">
          <div class="alarm-name">${p.name}</div>
          <div class="alarm-meta">${p.person} · RM ${p.amount.toFixed(2)}</div>
        </div>
        <span class="alarm-badge">${label}</span>
      </div>
    `;
  }).join('');
}

// =====================================================
//  UPCOMING STATS PANEL
// =====================================================
function renderUpcomingStats() {
  const payments    = getPaymentsForMonth(calYear, calMonth);
  const total       = payments.reduce((s,p) => s + p.amount, 0);
  const paid        = payments.filter(p => p.status === 'paid');
  const pending     = payments.filter(p => p.status === 'pending');
  const installments= pending.filter(p => p.installment);
  const instTotal   = installments.reduce((s,p) => s + p.amount, 0);
  const pct         = payments.length > 0 ? Math.round((paid.length / payments.length) * 100) : 0;
  const alarmCount  = pending.filter(p => getDaysUntil(p.dueDate) <= ALARM_DAYS && getDaysUntil(p.dueDate) >= 0).length;
  const fmt         = v => `RM ${v.toLocaleString('en-MY', { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
  const monthLabel  = `${MONTH_NAMES[calMonth].slice(0,3)} ${calYear}`;

  document.getElementById('upTotalLabel').textContent    = `📅 ${monthLabel} Total`;
  document.getElementById('upTotalAmount').textContent   = fmt(total);
  document.getElementById('upTotalCount').textContent    = `${payments.length} payments scheduled`;
  document.getElementById('upInstAmount').textContent    = fmt(instTotal);
  document.getElementById('upInstCount').textContent     = `${installments.length} active installment plan${installments.length !== 1 ? 's' : ''}`;
  document.getElementById('upPctValue').textContent      = `${pct}%`;
  document.getElementById('upPctBar').style.width        = `${pct}%`;
  document.getElementById('upPctDetail').textContent     = `${paid.length} paid  ·  ${pending.length} pending`;
  document.getElementById('upAlarmCount').textContent    = alarmCount;
  document.getElementById('upAlarmLabel').textContent    = alarmCount === 0
    ? '✅ All clear — no urgent payments!'
    : `🚨 ${alarmCount} payment${alarmCount>1?'s':''} need${alarmCount===1?'s':''} attention`;
  document.getElementById('upAlarmSection').className    = alarmCount > 0 ? 'up-alarm-section alarming' : 'up-alarm-section';
}

// =====================================================
//  HELPERS
// =====================================================
function getPaymentsForMonth(year, month) {
  return UPCOMING_PAYMENTS.filter(p => {
    const d = new Date(p.dueDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

function getDaysUntil(dateStr) {
  const due   = new Date(dateStr);
  const today = new Date(TODAY_DEMO);
  // zero out time
  due.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function getPaymentClass(payment) {
  if (payment.status === 'paid') return 'paid';
  const days = getDaysUntil(payment.dueDate);
  if (days < 0)          return 'overdue';
  if (days <= ALARM_DAYS) return 'alarm';
  if (days <= 14)        return 'soon';
  return 'normal';
}
