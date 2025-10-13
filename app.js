// Мягкие логи: никогда не падают, даже если нет #log/#status
const getEl = id => document.getElementById(id);
function log(...a){
  try {
    const el = getEl('log');
    const msg = a.map(x => (typeof x === 'string' ? x : JSON.stringify(x, null, 2))).join(' ');
    if (el) el.textContent += msg + '\n';
    console.log('[LOG]', ...a);
  } catch(_) { /* ignore */ }
}
function setStatus(s){
  try {
    const el = getEl('status');
    if (el) el.textContent = s;
  } catch(_) {}
}

// Покажем любые непойманные ошибки в UI
window.addEventListener('error', e => {
  log('❌ window.onerror:', e?.message || e);
  setStatus('Error: ' + (e?.message || 'unknown'));
});
window.addEventListener('unhandledrejection', e => {
  log('❌ Unhandled rejection:', e?.reason || e);
  setStatus('Promise error: ' + (e?.reason?.message  e?.reason  'unknown'));
});

// Гарантируем запуск ПОСЛЕ построения DOM
document.addEventListener('DOMContentLoaded', () => {
  log('app.js loaded ✅');
  setStatus('Booting…');

  const btnLogin = getEl('btnLogin');
  const btnPay   = getEl('btnPay');

  // Диагностика кликов
  if (btnLogin) btnLogin.addEventListener('click', () => log('Login button clicked'));
  if (btnPay)   btnPay.addEventListener('click',   () => log('Pay button clicked'));

  // Поддержка Pi SDK
  if (!window.Pi) {
    setStatus('❌ Pi SDK not found (open in Pi Browser).');
    return; // дальше смысла нет
  }

  try {
    // TESTNET/SANDBOX — для проверки
    Pi.init({ version: '2.0', sandbox: true });
    log('✅ Pi.init OK (sandbox:true).');
    setStatus('SDK ready. Please login.');
  } catch (e) {
    log('❌ Pi.init error', { message: e?.message, code: e?.code });
    setStatus('Pi.init failed.');
    return;
  }

  // ЛОГИН
  if (btnLogin) btnLogin.addEventListener('click', async () => {
    setStatus('Logging in…');
    try {
      const scopes = ['username', 'payments'];
      const auth = await Pi.authenticate(scopes, p => log('onIncompletePaymentFound', p));
      log('AUTH OK ✅', auth);
      setStatus('Logged in as @' + (auth?.user?.username || 'unknown'));
      if (btnPay) btnPay.disabled = false;
    } catch (e) {
      log('AUTH ERROR ❌', { name: e?.name, message: e?.message, code: e?.code });
      setStatus('Login failed: ' + (e?.code  e?.message  'unknown'));
    }
  });

  // ОПЛАТА (без серверных вызовов; только чтобы кнопка кликалась)
  if (btnPay) btnPay.addEventListener('click', async () => {
    try {
      // Если увидишь ошибку «Cannot create a payment without "payments" scope»
      // это значит, что логин не прошёл. Сначала нажми Login.
      const payment = await Pi.createPayment({
        amount: 0.001,
        memo: 'Test payment',
        metadata: { t: Date.now() }
      }, {
        onReadyForServerApproval: id => log('onReadyForServerApproval', id),
        onReadyForServerCompletion: (id, txid) => log('onReadyForServerCompletion', id, txid),
        onCancel: id => log('onCancel', id),
        onError: (err, id) => log('onError', { id, err })
      });
      log('createPayment() returned', payment);
      setStatus('Payment flow started (test).');
    } catch (e) {
      log('Payment error', { message: e?.message, code: e?.code });
      setStatus('Payment failed: ' + (e?.code  e?.message  'unknown'));
    }
  });
});
