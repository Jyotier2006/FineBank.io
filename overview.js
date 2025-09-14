// overview.js — renders Recent Transactions + Weekly Comparison on Overview page

// Demo data (same shape as your earlier MOCK.transactions)
const DEMO = {
  transactions: [
    {month:'Apr', income:180000, expenses:110000},
    {month:'May', income:180000, expenses:115000},
    {month:'Jun', income:185000, expenses:118000},
    {month:'Jul', income:185000, expenses:121000},
    {month:'Aug', income:190000, expenses:130000},
    {month:'Sep', income:195000, expenses:142000}
  ]
};

// Helpers
const inr = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
function weekPattern(){ const w=[1.00,0.92,0.96,1.08,1.04,1.18,1.22]; const s=w.reduce((a,b)=>a+b,0); return w.map(x=>x/s); }
function splitMonthlyToWeek(monthly){ const pat=weekPattern(); const weekTotal = monthly/30*7; return pat.map(p=>Math.round(weekTotal*p)); }

function renderRecent(T){
  const el = document.getElementById('dash-recent');
  if (!el) return;
  if (!T?.length) { el.innerHTML = '<div class="py-3 text-sm text-slate-500">No data</div>'; return; }
  const rows = T.slice(-4).reverse();
  el.innerHTML = rows.map(r => `
    <div class="flex items-center justify-between py-3">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-slate-100"></div>
        <div><div class="font-medium text-sm">${r.month} Summary</div><div class="text-xs text-slate-500">Expenses</div></div>
      </div>
      <div class="text-sm font-semibold">${inr(r.expenses)}</div>
    </div>
  `).join('');
}

function renderWeeklyBars(T){
  const svg = document.getElementById('dash-bars');
  if (!svg) return;

  svg.innerHTML = '';
  const last = (T||[]).slice(-1)[0] || null;
  const prev = (T||[]).slice(-2,-1)[0] || last;

  const thisWeek = last ? splitMonthlyToWeek(last.expenses) : [0,0,0,0,0,0,0];
  const lastWeek = prev ? splitMonthlyToWeek(prev.expenses) : [0,0,0,0,0,0,0];

  const w=420, h=180, pad=30, bw=18, gap=20;
  const vmax = Math.max(...thisWeek, ...lastWeek, 1);
  const y = v => (v / vmax) * (h - 2*pad);

  // axes
  svg.innerHTML += `<line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" stroke="#E5E7EB"/>`;
  svg.innerHTML += `<line x1="${pad}" y1="${pad}" x2="${pad}" y2="${h-pad}" stroke="#E5E7EB"/>`;

  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  for (let i=0;i<7;i++){
    const x = pad + i*(bw*2 + gap);
    const ha = y(thisWeek[i]), hb = y(lastWeek[i]);
    const ya = h - pad - ha, yb = h - pad - hb;

    svg.innerHTML += `<rect x="${x}" y="${ya}" width="${bw}" height="${ha}" rx="6" fill="#10b981">
      <title>This week ${days[i]}: ₹${thisWeek[i].toLocaleString('en-IN')}</title></rect>`;
    svg.innerHTML += `<rect x="${x + bw + 4}" y="${yb}" width="${bw}" height="${hb}" rx="6" fill="#CBD5E1">
      <title>Last week ${days[i]}: ₹${lastWeek[i].toLocaleString('en-IN')}</title></rect>`;
    svg.innerHTML += `<text x="${x + bw - 6}" y="${h - pad + 14}" font-size="10" fill="#64748B">${days[i]}</text>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Try to use your stored permissions/data if present; fall back to DEMO.
  let perms = {};
  try { perms = JSON.parse(localStorage.getItem('perms')||'{}'); } catch {}
  const allowTx = perms.transactions !== false; // default true
  const Tx = allowTx ? (window.APP_DATA?.transactions || DEMO.transactions) : [];

  renderRecent(Tx);
  renderWeeklyBars(Tx);
});
