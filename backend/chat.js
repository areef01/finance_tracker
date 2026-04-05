// =====================================================
//  BACKEND — Finance Chat Assistant
//  Data-aware chatbot using loaded EXPENSES &
//  UPCOMING_PAYMENTS arrays. No external API needed.
// =====================================================

const CHAT_BOT_NAME  = 'FinanceBot 🌸';
const TYPING_DELAY_MS = 900;

// Quick-reply chips shown at start
const QUICK_REPLIES = [
  { label:'💸 Total spending',      msg:'What is our total spending?' },
  { label:'📅 Upcoming payments',   msg:'Show me upcoming payments this month' },
  { label:'🏆 Top category',        msg:'Which category do we spend the most on?' },
  { label:'👩 Sarah\'s expenses',   msg:'How much has Sarah spent?' },
  { label:'👨 Alex\'s expenses',    msg:'How much has Alex spent?' },
  { label:'💰 Savings',             msg:'How much have we saved?' },
  { label:'🚨 Urgent payments',     msg:'Any urgent payments due soon?' },
  { label:'📊 Monthly breakdown',   msg:'Show me monthly breakdown' },
];

// =====================================================
//  INIT
// =====================================================
function initChat() {
  const btn   = document.getElementById('chatFloatBtn');
  const panel = document.getElementById('chatPanel');
  const close = document.getElementById('chatCloseBtn');
  const input = document.getElementById('chatInput');
  const send  = document.getElementById('chatSendBtn');

  btn.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    if (isOpen && document.getElementById('chatMessages').children.length === 0) {
      showWelcome();
    }
    if (isOpen) setTimeout(() => input.focus(), 300);
  });

  close.addEventListener('click', () => {
    panel.classList.remove('open');
    btn.classList.remove('active');
  });

  send.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
}

function handleSend() {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  appendMessage('user', text);
  showTyping();
  setTimeout(() => {
    removeTyping();
    const reply = processMessage(text);
    appendMessage('bot', reply);
  }, TYPING_DELAY_MS);
}

function handleQuickReply(msg) {
  appendMessage('user', msg);
  showTyping();
  setTimeout(() => {
    removeTyping();
    appendMessage('bot', processMessage(msg));
  }, TYPING_DELAY_MS);
}

// =====================================================
//  MESSAGE RENDERING
// =====================================================
function appendMessage(role, html) {
  const box = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${role}`;
  div.innerHTML = `<div class="chat-bubble">${html}</div>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;

  // Remove quick replies after first user message
  if (role === 'user') {
    const qr = document.getElementById('chatQuickReplies');
    if (qr) qr.remove();
  }
}

function showTyping() {
  const box = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className  = 'chat-msg chat-msg-bot';
  div.id         = 'chatTyping';
  div.innerHTML  = `<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>`;
  box.appendChild(div);
  box.scrollTop  = box.scrollHeight;
}

function removeTyping() {
  document.getElementById('chatTyping')?.remove();
}

function showWelcome() {
  const box = document.getElementById('chatMessages');

  // Welcome bubble
  appendMessage('bot', `
    Hey there! 👋 I'm <strong>FinanceBot</strong>, your personal finance assistant!<br><br>
    I know everything about Sarah & Alex's expenses, savings, and upcoming payments.
    Ask me anything or pick a quick question below 👇
  `);

  // Quick reply chips
  const qrDiv = document.createElement('div');
  qrDiv.id        = 'chatQuickReplies';
  qrDiv.className = 'chat-quick-replies';
  QUICK_REPLIES.forEach(qr => {
    const btn  = document.createElement('button');
    btn.className   = 'chat-qr-btn';
    btn.textContent = qr.label;
    btn.addEventListener('click', () => handleQuickReply(qr.msg));
    qrDiv.appendChild(btn);
  });
  box.appendChild(qrDiv);
  box.scrollTop = box.scrollHeight;
}

// =====================================================
//  MESSAGE PROCESSOR — NLP-lite keyword matching
// =====================================================
function processMessage(raw) {
  const t = raw.toLowerCase();

  // Greetings
  if (/^(hi|hello|hey|helo|howdy|oi|yo)\b/.test(t))
    return greetResponse();

  // Help
  if (/\b(help|what can you|what do you know|commands)\b/.test(t))
    return helpResponse();

  // Urgent / alarm / due soon
  if (/\b(urgent|alarm|due soon|overdue|5 days|this week|danger)\b/.test(t))
    return urgentPaymentsResponse();

  // Upcoming payments
  if (/\b(upcoming|payment|due|bill|installment|install)\b/.test(t))
    return upcomingPaymentsResponse();

  // Savings
  if (/\b(saving|savings|save|emergency fund)\b/.test(t))
    return savingsResponse();

  // Top / highest category
  if (/\b(top|most|highest|biggest|largest)\b/.test(t) && /\b(categor|spend|expense)\b/.test(t))
    return topCategoryResponse();

  // All categories
  if (/\b(categor|breakdown by cat)\b/.test(t))
    return categoryBreakdownResponse();

  // Monthly breakdown
  if (/\b(month|monthly|per month)\b/.test(t))
    return monthlyBreakdownResponse();

  // Sarah
  if (/\bsarah\b/.test(t))
    return personResponse('Sarah');

  // Alex
  if (/\balex\b/.test(t))
    return personResponse('Alex');

  // Total / overall
  if (/\b(total|overall|sum|how much|all together)\b/.test(t))
    return totalSpendingResponse();

  // Compare
  if (/\b(compar|who spend|who spent|more|less)\b/.test(t))
    return comparePersonsResponse();

  // Transaction count
  if (/\b(how many|count|number of|transaction)\b/.test(t))
    return transactionCountResponse();

  return defaultResponse(raw);
}

// =====================================================
//  RESPONSE GENERATORS
// =====================================================
const fmt = v => `<strong>RM ${v.toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>`;

function greetResponse() {
  const greets = [
    'Hi there! 😊 How can I help you with your finances today?',
    'Hello! 🌸 Ready to dig into those numbers!',
    'Hey! 👋 What would you like to know about your expenses?',
  ];
  return greets[Math.floor(Math.random() * greets.length)];
}

function helpResponse() {
  return `
    Here's what I can help you with:<br><br>
    💸 <strong>Spending</strong> — "How much have we spent total?"<br>
    👩👨 <strong>Per person</strong> — "Show Sarah's expenses" or "Alex's total"<br>
    🏆 <strong>Categories</strong> — "What's the top spending category?"<br>
    📅 <strong>Monthly</strong> — "Show monthly breakdown"<br>
    💰 <strong>Savings</strong> — "How much have we saved?"<br>
    🚨 <strong>Urgent</strong> — "Any urgent payments?"<br>
    📋 <strong>Upcoming</strong> — "Show upcoming payments"<br><br>
    Just type naturally — I'll figure it out! 😄
  `;
}

function totalSpendingResponse() {
  const total    = EXPENSES.reduce((s,e) => s+e.amount, 0);
  const savings  = EXPENSES.filter(e=>e.category==='Savings').reduce((s,e)=>s+e.amount, 0);
  const spending = total - savings;
  const txCount  = EXPENSES.length;

  return `
    Here's your <strong>overall financial summary</strong> 📊<br><br>
    💸 Total outflow: ${fmt(total)}<br>
    🛒 Actual spending: ${fmt(spending)}<br>
    💰 Savings set aside: ${fmt(savings)}<br>
    📋 Transactions recorded: <strong>${txCount}</strong><br>
    📅 Period: <strong>Oct 2025 — Mar 2026</strong> (6 months)
  `;
}

function savingsResponse() {
  const savings  = EXPENSES.filter(e=>e.category==='Savings').reduce((s,e)=>s+e.amount, 0);
  const total    = EXPENSES.reduce((s,e) => s+e.amount, 0);
  const pct      = ((savings/total)*100).toFixed(1);
  const monthly  = savings / 6;

  return `
    💰 <strong>Savings Summary</strong><br><br>
    Total saved: ${fmt(savings)}<br>
    Monthly average: ${fmt(monthly)}<br>
    Savings rate: <strong>${pct}%</strong> of total outflow<br><br>
    ${parseFloat(pct) >= 15
      ? '✅ Great job! You\'re saving more than 15% — that\'s a healthy rate! 🎉'
      : '💡 Tip: Aim for at least 20% savings rate for financial health!'}
  `;
}

function personResponse(name) {
  const data     = EXPENSES.filter(e=>e.person===name);
  const total    = data.reduce((s,e)=>s+e.amount, 0);
  const savings  = data.filter(e=>e.category==='Savings').reduce((s,e)=>s+e.amount, 0);
  const spending = total - savings;

  // Top 3 categories
  const catMap = {};
  data.filter(e=>e.category!=='Savings').forEach(e => catMap[e.category]=(catMap[e.category]||0)+e.amount);
  const top3 = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,3);

  const emoji = name==='Sarah' ? '👩' : '👨';
  const top3Html = top3.map(([cat,amt]) => {
    const icon = CATEGORY_CONFIG[cat]?.icon || '•';
    return `&nbsp;&nbsp;${icon} ${cat}: ${fmt(amt)}`;
  }).join('<br>');

  return `
    ${emoji} <strong>${name}'s Expense Report</strong><br><br>
    💸 Total outflow: ${fmt(total)}<br>
    🛒 Actual spending: ${fmt(spending)}<br>
    💰 Savings: ${fmt(savings)}<br>
    📋 Transactions: <strong>${data.length}</strong><br><br>
    🏆 <strong>Top categories:</strong><br>${top3Html}
  `;
}

function comparePersonsResponse() {
  const sarahTotal = EXPENSES.filter(e=>e.person==='Sarah').reduce((s,e)=>s+e.amount, 0);
  const alexTotal  = EXPENSES.filter(e=>e.person==='Alex').reduce((s,e)=>s+e.amount, 0);
  const diff       = Math.abs(sarahTotal - alexTotal);
  const higher     = sarahTotal > alexTotal ? 'Sarah' : 'Alex';

  return `
    👥 <strong>Sarah vs Alex Comparison</strong><br><br>
    👩 Sarah: ${fmt(sarahTotal)}<br>
    👨 Alex: ${fmt(alexTotal)}<br>
    📊 Difference: ${fmt(diff)}<br><br>
    ${higher === 'Sarah'
      ? '👩 Sarah spends more overall — mostly on skincare & shopping! 💅'
      : '👨 Alex spends more overall — mostly on big installments & travel! 🧳'}
  `;
}

function topCategoryResponse() {
  const catMap = {};
  EXPENSES.filter(e=>e.category!=='Savings').forEach(e => catMap[e.category]=(catMap[e.category]||0)+e.amount);
  const sorted = Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  const [topName, topAmt] = sorted[0];
  const total   = Object.values(catMap).reduce((a,b)=>a+b,0);
  const pct     = ((topAmt/total)*100).toFixed(1);
  const icon    = CATEGORY_CONFIG[topName]?.icon || '•';

  return `
    🏆 <strong>Top Spending Category</strong><br><br>
    ${icon} <strong>${topName}</strong><br>
    Total: ${fmt(topAmt)} (${pct}% of all spending)<br><br>
    📊 <strong>All categories ranked:</strong><br>
    ${sorted.slice(0,6).map(([c,v],i) => {
      const ic = CATEGORY_CONFIG[c]?.icon || '•';
      return `&nbsp;&nbsp;${i+1}. ${ic} ${c}: ${fmt(v)}`;
    }).join('<br>')}
    ${sorted.length > 6 ? `<br>&nbsp;&nbsp;<em>...and ${sorted.length-6} more</em>` : ''}
  `;
}

function categoryBreakdownResponse() {
  const catMap = {};
  EXPENSES.filter(e=>e.category!=='Savings').forEach(e => catMap[e.category]=(catMap[e.category]||0)+e.amount);
  const sorted = Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  const total  = Object.values(catMap).reduce((a,b)=>a+b,0);

  const rows = sorted.map(([c,v]) => {
    const ic  = CATEGORY_CONFIG[c]?.icon || '•';
    const pct = ((v/total)*100).toFixed(0);
    return `&nbsp;&nbsp;${ic} ${c}: ${fmt(v)} <em>(${pct}%)</em>`;
  }).join('<br>');

  return `
    📊 <strong>Full Category Breakdown</strong><br>
    <em>Total spending: ${fmt(total)}</em><br><br>
    ${rows}
  `;
}

function monthlyBreakdownResponse() {
  const months   = [...new Set(EXPENSES.map(e=>e.month))];
  const rows = months.map(m => {
    const total   = EXPENSES.filter(e=>e.month===m).reduce((s,e)=>s+e.amount,0);
    const savings = EXPENSES.filter(e=>e.month===m && e.category==='Savings').reduce((s,e)=>s+e.amount,0);
    const spend   = total - savings;
    return `&nbsp;&nbsp;📅 ${m}: ${fmt(spend)} <em>spent</em> + ${fmt(savings)} <em>saved</em>`;
  }).join('<br>');

  const maxMonth = months.reduce((best,m) => {
    const t = EXPENSES.filter(e=>e.month===m).reduce((s,e)=>s+e.amount,0);
    return t > best.amt ? {m,amt:t} : best;
  }, {m:'',amt:0});

  return `
    📅 <strong>Monthly Breakdown</strong><br><br>
    ${rows}<br><br>
    🔥 Highest spend month: <strong>${maxMonth.m}</strong>
  `;
}

function upcomingPaymentsResponse() {
  const thisMonth = UPCOMING_PAYMENTS.filter(p => {
    const d = new Date(p.dueDate);
    return d.getFullYear() === TODAY_DEMO.getFullYear() && d.getMonth() === TODAY_DEMO.getMonth();
  });
  const total   = thisMonth.reduce((s,p)=>s+p.amount,0);
  const paid    = thisMonth.filter(p=>p.status==='paid');
  const pending = thisMonth.filter(p=>p.status==='pending');

  const pendingRows = pending.slice(0,5).map(p => {
    const days = Math.round((new Date(p.dueDate) - TODAY_DEMO) / 86400000);
    const urgency = days <= ALARM_DAYS ? '🚨' : days <= 14 ? '⚠️' : '📋';
    return `&nbsp;&nbsp;${urgency} ${p.icon} ${p.name}: ${fmt(p.amount)} <em>(${days <= 0 ? 'today!' : `${days}d`})</em>`;
  }).join('<br>');

  return `
    📅 <strong>Upcoming Payments — April 2026</strong><br><br>
    💰 Total due: ${fmt(total)}<br>
    ✅ Paid: <strong>${paid.length}</strong> &nbsp; ⏳ Pending: <strong>${pending.length}</strong><br><br>
    <strong>Pending payments:</strong><br>
    ${pendingRows}
    ${pending.length > 5 ? `<br>&nbsp;&nbsp;<em>...and ${pending.length-5} more</em>` : ''}
  `;
}

function urgentPaymentsResponse() {
  const alarms = UPCOMING_PAYMENTS.filter(p => {
    if (p.status === 'paid') return false;
    const days = Math.round((new Date(p.dueDate) - TODAY_DEMO) / 86400000);
    return days >= 0 && days <= ALARM_DAYS;
  });

  if (alarms.length === 0) {
    return `✅ <strong>All clear!</strong> No urgent payments in the next ${ALARM_DAYS} days. You're on top of it! 🎉`;
  }

  const rows = alarms.map(p => {
    const days = Math.round((new Date(p.dueDate) - TODAY_DEMO) / 86400000);
    const label = days === 0 ? '<strong style="color:#c03030">TODAY!</strong>' : days === 1 ? '<strong>Tomorrow</strong>' : `<strong>${days} days left</strong>`;
    return `&nbsp;&nbsp;🚨 ${p.icon} ${p.name}: ${fmt(p.amount)} — ${label}`;
  }).join('<br>');

  return `
    🚨 <strong>${alarms.length} Urgent Payment${alarms.length>1?'s':''} Due Soon!</strong><br><br>
    ${rows}<br><br>
    💡 Make sure to settle these before the due date to avoid late charges!
  `;
}

function transactionCountResponse() {
  const sarah = EXPENSES.filter(e=>e.person==='Sarah').length;
  const alex  = EXPENSES.filter(e=>e.person==='Alex').length;

  return `
    📋 <strong>Transaction Count</strong><br><br>
    Total: <strong>${EXPENSES.length}</strong> transactions<br>
    👩 Sarah: <strong>${sarah}</strong> transactions<br>
    👨 Alex: <strong>${alex}</strong> transactions<br>
    📅 Period: Oct 2025 — Mar 2026 (6 months)<br>
    📊 Average: <strong>${(EXPENSES.length/6).toFixed(0)}</strong> transactions/month
  `;
}

function defaultResponse(raw) {
  const suggestions = ['total spending', 'upcoming payments', 'Sarah\'s expenses', 'top category', 'monthly breakdown'];
  const sugg = suggestions[Math.floor(Math.random() * suggestions.length)];
  return `
    Hmm, I'm not sure about that one 🤔<br><br>
    Try asking me things like:<br>
    &nbsp;&nbsp;• "Show me <em>${sugg}</em>"<br>
    &nbsp;&nbsp;• "How much has Sarah spent?"<br>
    &nbsp;&nbsp;• "Any urgent payments?"<br><br>
    Or type <strong>"help"</strong> to see everything I can do! 😊
  `;
}
