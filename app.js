// Простой лог в блок
const logEl = () => document.getElementById('log');
const statusEl = () => document.getElementById('status');
const log = (...a) => { logEl().textContent += a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ') + '\n'; };

(function boot() {
  // Маркер, что скрипт действительно загрузился
  log('app.js loaded ✅');
  statusEl().textContent = 'Booting…';
})();

// После загрузки DOM навешиваем клики
document.addEventListener('DOMContentLoaded', () => {
  const btnLogin = document.getElementById('btnLogin');
  const btnPay   = document.getElementById('btnPay');

  // Проверка кликов
  btnLogin.addEventListener('click', () => log('Login button clicked'));
  btnPay.addEventListener('click',   () => log('Pay button clicked'));

  // Инициализация SDK (TESTNET/SANDBOX)
  if (!window.Pi) {
    statusEl().textContent = '❌ Pi SDK not found (open in Pi Browser).';
    return;
  }

  try {
    Pi.init({ version: '2.0', sandbox: true });
    statusEl().textContent = '✅ SDK ready (sandbox:true). Please login.';
  } catch (e) {
    statusEl().textContent = '❌ Pi.init error';
    log('Pi.init error', { message: e?.message, code: e?.code });
    return;
  }

  // ЛОГИН
  btnLogin.addEventListener('click', async () => {
    try {
      const scopes = ['username','payments'];
      const auth = await Pi.authenticate(scopes, (p) => log('onIncompletePaymentFound', p));
      log('AUTH OK', auth);
      statusEl().textContent = '✅ Logged in as @' + (auth?.user?.username || 'unknown');
      btnPay.disabled = false;
    } catch (e) {
      log('AUTH ERROR', { name: e?.name, message: e?.message, code: e?.code });
      statusEl().textContent = '❌ Login failed: ' + (e?.code  e?.message  'unknown');
    }
  });

  // ОПЛАТА (без серверных вызовов — только проверка, что кнопка кликается)
  btnPay.addEventListener('click', async () => {
    try {
      const payment = await Pi.createPayment({
        amount: 0.001,
        memo: 'TravelPoint Pi test',
        metadata: { orderId: Date.now() }
      }, {
        onReadyForServerApproval: (paymentId) => log('onReadyForServerApproval', paymentId),
        onReadyForServerCompletion: (paymentId, txid) => log('onReadyForServerCompletion', { paymentId, txid }),
        onCancel: (paymentId) => log('onCancel', paymentId),
        onError: (err, paymentId) => log('onError', { err, paymentId })
      });

      log('createPayment result', payment);
    } catch (e) {
      log('createPayment ERROR', { message: e?.message, code: e?.code });
      statusEl().textContent = '❌ Payment error: ' + (e?.code  e?.message  'unknown');
    }
  });
});
