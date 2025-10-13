// ---------- helpers ----------
function $(id){ return document.getElementById(id); }
function log(){
  const box = $('log');
  const parts = [];
  for (let i=0;i<arguments.length;i++){
    try { parts.push(typeof arguments[i]==='string'? arguments[i] : JSON.stringify(arguments[i])); }
    catch(_){ parts.push(String(arguments[i])); }
  }
  box.textContent += parts.join(' ') + '\n';
  box.scrollTop = box.scrollHeight;
}
function setStatus(t){ $('status').textContent = t; }

// ---------- boot marker ----------
(function(){
  log('app.js loaded');
  setStatus('Booting…');
})();

// ---------- global error taps ----------
window.addEventListener('error', (e)=>{
  log('window.error:', {message:e.message, filename:e.filename, lineno:e.lineno, colno:e.colno});
});
window.addEventListener('unhandledrejection', (e)=>{
  log('unhandledrejection:', {reason: (e.reason && (e.reason.codee.reason.messageString(e.reason)))});
});

// ---------- main ----------
window.addEventListener('DOMContentLoaded', async () => {
  const btnLogin = $('btnLogin');
  const btnPay   = $('btnPay');

  // клики живые
  btnLogin.addEventListener('click', ()=> log('Login button clicked'));
  btnPay  .addEventListener('click', ()=> log('Pay button clicked'));

  // немного среды
  log('UA has PiBrowser:', navigator.userAgent.includes('PiBrowser'));
  log('location.host:', location.host);

  // есть ли SDK вообще?
  log('typeof window.Pi:', typeof window.Pi);
  if (!window.Pi) {
    setStatus('❌ Pi SDK not found (open this page in Pi Browser).');
    return;
  }

  // init
  try {
    // В TESTNET используем sandbox:true
    Pi.init({ version: '2.0', sandbox: true });
    setStatus('SDK ready (sandbox:true). Please login.');
    log('Pi.init done');
    log('typeof Pi.authenticate:', typeof Pi.authenticate);
  } catch(e) {
    setStatus('Pi.init error: ' + (e?.message || 'unknown'));
    log('Pi.init error:', {name:e?.name, message:e?.message, code:e?.code});
    return;
  }

  // LOGIN (с таймаут-сторожем)
  btnLogin.addEventListener('click', async () => {
    setStatus('Authorizing…');
    log('Auth start…');

    const scopes = ['username','payments'];
    let settled = false;

    // сторож: если за 10с ничего не случится — напишем
    const guard = setTimeout(()=>{
      if (!settled) {
        log('AUTH TIMEOUT: no response from Pi.authenticate within 10s');
        setStatus('Auth timed out. (No response from SDK)');
      }
    }, 10000);

    try {
      const auth = await Pi.authenticate(scopes, p => log('onIncompletePaymentFound:', p));
      settled = true; clearTimeout(guard);
      log('AUTH OK ✅', auth);
      setStatus('Logged in as @' + (auth?.user?.username || 'unknown'));
      btnPay.disabled = false;
    } catch(e) {
      settled = true; clearTimeout(guard);
      log('AUTH ERROR ❌', {name:e?.name, message:e?.message, code:e?.code, toString: e?.toString?.()});
      setStatus('Login failed: ' + (e?.code || e?.message || 'unknown'));
    }
  });

  // PAY (пока просто проверка клика)
  btnPay.addEventListener('click', ()=>{
    setStatus('Payment flow disabled in debug build (кнопка кликается ✅).');
  });
});
