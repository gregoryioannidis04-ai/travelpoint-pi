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
  setStatus('Booting…');
})();

// ===== main =====
window.addEventListener('DOMContentLoaded', () => {
  const btnLogin = $('btnLogin');
  const btnPay   = $('btnPay');

  // чтобы оплату нельзя было нажать до логина
  btnPay.disabled = true;

  btnLogin.addEventListener('click', () => log('Login button clicked'));
  btnPay  .addEventListener('click', () => log('Pay button clicked'));

  if (!window.Pi) {
    setStatus('❌ Pi SDK not found (open in Pi Browser).');
    return;
  }

  try {
    // для тестов лучше sandbox:true
    Pi.init({ version: '2.0', sandbox: true });
    log('Pi.init executed.');
    setStatus('SDK ready. Please login.');
  } catch (e) {
    setStatus('Pi.init error');
    log('Pi.init error', e);
    return;
  }

  // ——— AUTH ———
  btnLogin.addEventListener('click', async () => {
    setStatus('Starting auth…');
    log('UA:', navigator.userAgent);
    log('location.host:', location.host);
    log('typeof Pi.authenticate:', typeof Pi.authenticate);

    const AUTH_TIMEOUT_MS = 60000; // 60 секунд — можно изменить при необходимости

let timedOut = false;
const t = setTimeout(() => {
  timedOut = true;
  const secs = Math.round(AUTH_TIMEOUT_MS / 1000);
  setStatus(Auth timed out (no response from SDK in ${secs}s));
  log(AUTH TIMEOUT: no response within ${secs}s);
}, AUTH_TIMEOUT_MS);

    try {
      const scopes = ['username', 'payments'];
      const onIncompletePaymentFound = (p) => log('onIncompletePaymentFound', p);

      log('Auth start…');
      const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);

      if (timedOut) return;
      clearTimeout(t);

      log('AUTH OK', auth);
      setStatus('Logged in as @' + (auth?.user?.username || 'unknown'));
      btnPay.disabled = false;
    } catch (e) {
      if (!timedOut) clearTimeout(t);
      setStatus('Auth failed');
      log('AUTH ERROR', { name: e?.name, code: e?.code, message: e?.message });
    }
  });

  // ——— PAYMENT (demo) ———
  btnPay.addEventListener('click', async () => {
    setStatus('Starting payment…');
    try {
      const paymentData = {
        amount: 0.001,
        memo: 'TravelPoint test payment',
        metadata: { source: 'demo' },
      };

      const callbacks = {
        onReadyForServerApproval: async (paymentId) => {
          log('onReadyForServerApproval', paymentId);
          await fetch('/api/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          log('onReadyForServerCompletion', { paymentId, txid });
          await fetch('/api/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid }),
          });
        },
        onCancel: (e) => {
          log('onCancel', e);
          setStatus('Payment cancelled');
        },
        onError: (e) => {
          log('onError', { name: e?.name, code: e?.code, message: e?.message });
          setStatus('Payment error');
        },
      };

      const result = await Pi.createPayment(paymentData, callbacks);
      log('Payment result', result);
      setStatus('Payment flow finished');
    } catch (e) {
      log('createPayment error', e);
      setStatus('Payment start failed');
    }
  });
}); // <<< ВОТ ЭТОГО закрывающего блока у тебя не хватало
