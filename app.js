// --- helpers ---
function $(id){ return document.getElementById(id); }
function log(){
  var out = $('log');
  var parts = [];
  for (var i=0;i<arguments.length;i++){
    try { parts.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }
    catch(_){ parts.push(String(arguments[i])); }
  }
  out.textContent += parts.join(' ') + "\n";
}
function setStatus(t){ $('status').textContent = t; }

// --- boot marker (покажет, что скрипт действительно исполнился) ---
(function(){
  log('app.js loaded');
  setStatus('Booting…');
})();

// --- основная логика ---
window.addEventListener('DOMContentLoaded', function(){
  var btnLogin = $('btnLogin');
  var btnPay   = $('btnPay');

  // клики точно живые?
  btnLogin.addEventListener('click', function(){ log('Login button clicked'); });
  btnPay.addEventListener('click',   function(){ log('Pay button clicked'); });

  // Проверка наличия Pi SDK
  if (!window.Pi) {
    setStatus('❌ Pi SDK not found (open this page in Pi Browser).');
    return;
  }

  // Инициализация SDK (TESTNET/SANDBOX)
  try {
    Pi.init({ version: '2.0', sandbox: true }); // ← если нужно mainnet, поставьте false
    setStatus('SDK ready (sandbox:true). Please login.');
  } catch(e) {
    setStatus('Pi.init error: ' + (e && e.message ? e.message : 'unknown'));
    log('Pi.init error', { name: e && e.name, message: e && e.message, code: e && e.code });
    return;
  }

  // Логин
  btnLogin.addEventListener('click', function(){
    setStatus('Authorizing…');
    try {
      var scopes = ['username','payments'];
      Pi.authenticate(scopes, function(p){ log('onIncompletePaymentFound', p); })
        .then(function(auth){
          log('AUTH OK', auth);
          setStatus('Logged in as @' + (auth && auth.user && auth.user.username ? auth.user.username : 'unknown'));
          btnPay.disabled = false;
        })
        .catch(function(e){
          log('AUTH ERROR', { name: e && e.name, message: e && e.message, code: e && e.code });
          setStatus('Login failed: ' + (e && (e.code || e.message) ? (e.code || e.message) : 'unknown'));
        });
    } catch(e){
      log('AUTH THROW', e);
      setStatus('Login failed (throw): ' + (e && e.message ? e.message : 'unknown'));
    }
  });

  // Платеж (только чтобы проверить реакцию кнопки)
  btnPay.addEventListener('click', function(){
    setStatus('Payment flow disabled in debug build. (Кнопка кликается ✅)');
  });
});
