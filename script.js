// Header interactions (animations + mobile menu)
const headerEl = document.querySelector('header.sticky');
const navPanel = document.getElementById('navPanel');
const menuBtn  = document.getElementById('menuBtn');

function toggleMenu(){ navPanel?.classList.toggle('open'); }
menuBtn?.addEventListener('click', toggleMenu);

// Close mobile menu when clicking a link
navPanel?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navPanel.classList.remove('open'))
);

// Duplicate Load Demo button for mobile panel
document.getElementById('loadDemoBtn')?.addEventListener('click', async ()=>{
  await loadDataFromFiles();
});


// Elevate header on scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 4) headerEl?.classList.add('scrolled');
  else headerEl?.classList.remove('scrolled');
});
// ===== Option A: Load from local JSON files in /mock as primary, fallback to MOCK =====
let REMOTE = null; // when set, computeAll() will prefer REMOTE over MOCK

async function fetchMockData(){
  // Mock MCP Data (inline fallback)
const MOCK = {
  assets: { cash: 60000, bank: [{ name:'HDFC', balance:240000 }, { name:'SBI', balance:90000 }], property:[{ name:'Apartment', value:4500000 }], others:120000 },
  liabilities: { loans:[{ name:'Home Loan', outstanding:2200000, rate:8.2 }, { name:'Car Loan', outstanding:320000, rate:9.5 }], cards:[{ name:'VISA', outstanding:18000, apr:36 }] },
  transactions: [ { month:'Apr', income:180000, expenses:110000 }, { month:'May', income:180000, expenses:115000 }, { month:'Jun', income:185000, expenses:118000 }, { month:'Jul', income:185000, expenses:121000 }, { month:'Aug', income:190000, expenses:130000 }, { month:'Sep', income:195000, expenses:142000 } ],
  epf: { employee:350000, employer:350000, current:800000 },
  creditScore: { score:752, rating:'Good' },
  investments: { stocks:[{ scrip:'INFY', value:220000 }, { scrip:'TCS', value:260000 }], mutualFunds:[{ name:'Nifty 50 Index', value:340000 }], bonds:[{ name:'GOI 2030', value:100000 }] }
};
document.getElementById('resetPerms')?.addEventListener('click', () => {
  localStorage.removeItem('perms');
  renderPerms();
  computeAll();
});

// ===== Option A: Load from local JSON files in /mock as primary, fallback to MOCK =====
let REMOTE = null; // when set, computeAll() will prefer REMOTE over MOCK

async function fetchMockData(){
  const base = 'mock'; // folder next to index.html
  const urls = ['assets','liabilities','transactions','epf','creditScore','investments'].map(n=>`${base}/${n}.json`);
  const [assets, liabilities, transactions, epf, creditScore, investments] = await Promise.all(
    urls.map(u => fetch(u).then(r=>{ if(!r.ok) throw new Error(`${u}: ${r.status}`); return r.json(); }))
  );
  return { assets, liabilities, transactions, epf, creditScore, investments };
}

async function loadDataFromFiles(){
  try { REMOTE = await fetchMockData(); pushMsg('assistant','Loaded data from /mock JSON files.'); }
  catch(e){ console.warn('JSON load error -> using inline data', e); REMOTE = null; pushMsg('assistant','Could not read /mock JSON (using inline demo data).'); }
  computeAll();
}

}

async function loadDataFromFiles(){
  try {
    REMOTE = await fetchMockData();
    pushMsg('assistant','Loaded data from /mock JSON files.');
  } catch (e) {
    console.warn('JSON load error -> using inline data', e);
    REMOTE = null; // fallback to inline MOCK
    pushMsg('assistant','Could not read /mock JSON (using inline demo data).');
  }
  computeAll();
}
