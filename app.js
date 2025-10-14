// ===== helpers =====
const $ = (id) => document.getElementById(id);
const log = (...a) => {
  const el = $('log');
  const msg = a.map(x => {
    try { return typeof x === 'string' ? x : JSON.stringify(x); }
    catch(_) { return String(x); }
  }).join(' ');
  el.textContent += msg + '\n';
};
const setStatus = (t) => $('status').textContent = t;

// ===== boot marker =====
(() => {
  log('app.js loaded');
  setStatus('Authorizing…');
})();

// ===== main =====
window.addEventListener('DOMContentLoaded', () => {
  const btnLogin = $('btnLogin');
  const btnPay   = $('btnPay');

  btnLogin.addEventListener('click', () => log('Login button clicked'));
  btnPay.addEventListener('click',   () => log('Pay button clicked'));

  if (!window.Pi) {
    setStatus('❌ Pi SDK not found (open in Pi Browser).');
    return;
  }

  try {
    // Реальный SDK (mainnet-режим). Для тестов auth не важен testnet/mainnet.
    Pi.init({ version: '2.0', sandbox: false });
    log('Pi.init executed.');
  } catch (e) {
    setStatus('Pi.init error');
    log('Pi.init error', e);
    return;
  }

  // ——— AUTH with full diagnostics ———
  btnLogin.addEventListener('click', async () => {
    setStatus('Starting auth…');
    log('UA:', navigator.userAgent);
    log('location.host:', location.host);
    log('typeof Pi.authenticate:', typeof Pi.authenticate);

    // Фоллбек-таймаут, если SDK вдруг «молчит»
    let timedOut = false;
    const t = setTimeout(() => {
      timedOut = true;
      setStatus('Auth timed out (no response from SDK in 15s)');
      log('AUTH TIMEOUT: no response within 15s');
    }, 15000);

    try {
      const scopes = ['username', 'payments']; // payments можно оставить — SDK это норм
      const onIncompletePaymentFound = (p) => log('onIncompletePaymentFound', p);

      log('Auth start…');
      const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);

      if (timedOut) return; // уже показали таймаут
      clearTimeout(t);

      log('AUTH OK', auth);
      setStatus('Logged in as @' + (auth?.user?.username || 'unknown'));
      btnPay.disabled = false;
    } catch (e) {
      if (!timedOut) clearTimeout(t);
      setStatus('Auth failed');
      log('AUTH ERROR', { name: e?.name, code: e?.code, message: e?.message });
      // частые коды: user_cancelled, not_authorized, network_error
    }
  });

  // Платёж (пока только кликабельность)
  btnPay.addEventListener('click', () => {
    setStatus('Payment flow is disabled in this demo.');
    log('Pay clicked (demo only)');
  });
});
