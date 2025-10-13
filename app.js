// app.js — demo shim: uses real Pi SDK if present, otherwise provides a mock for demo purposes.
// Safe for local demo; remove or gate before production.

(function(){
  // helpers
  function $id(id){ return document.getElementById(id); }
  function log(){
    try{
      var out = $id('log');
      var parts = [];
      for(var i=0;i<arguments.length;i++){
        try{ parts.push(typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i])); }
        catch(_){ parts.push(String(arguments[i])); }
      }
      if(out) out.textContent += parts.join(' ') + '\n';
      console.log.apply(console, arguments);
    }catch(_){}
  }
  function setStatus(t){
    try{ var s = $id('status'); if(s) s.textContent = t; } catch(_) {}
  }

  // boot marker
  document.addEventListener('DOMContentLoaded', function(){
    log('app.js loaded');
    setStatus('Booting…');

    var btnLogin = $id('btnLogin');
    var btnPay   = $id('btnPay');

    if(btnLogin) btnLogin.addEventListener('click', function(){ log('Login button clicked'); });
    if(btnPay)   btnPay.addEventListener('click', function(){ log('Pay button clicked'); });

    // Provide mock Pi if real SDK absent
    var isRealPi = (typeof window.Pi !== 'undefined' && window.Pi && typeof window.Pi.init === 'function');
    if(!isRealPi){
      log('Real Pi SDK NOT detected — enabling DEMO mock (for presentation only).');
      // create a lightweight mock implementing methods we use
      window.Pi = (function(){
        var mock = {};

        mock.init = function(opts){
          log('mock Pi.init called', opts || {});
          // do nothing
        };

        // authenticate: scopes array, onIncomplete callback
        mock.authenticate = function(scopes, onIncomplete){
          log('mock Pi.authenticate called; scopes=' + JSON.stringify(scopes));
          // show a simple confirm dialog so user can "allow" or "deny"
          return new Promise(function(resolve, reject){
            // slight delay to simulate real UX
            setTimeout(function(){
              var allow = confirm('DEMO: Allow app to access: ' + (scopes || []).join(', ') + '\n(Click OK = allow)');
              if(!allow){
                var err = { name: 'MockAuthError', message: 'user_denied' };
                log('mock authenticate denied by user');
                reject(err);
                return;
              }
              // emulate returned auth object
              var auth = {
                user: { username: 'demo_user', id: 'demo-uid-123' },
                scopes: scopes || []
              };
              log('mock authenticate resolved', auth);
              resolve(auth);
            }, 600);
          });
        };

        // createPayment: payload, handlers object with callbacks
        mock.createPayment = function(payload, handlers){
          log('mock Pi.createPayment payload', payload);
          // emulate a payment object
          var paymentId = 'mock-pay-' + Date.now();
          var paymentObj = { id: paymentId, amount: payload && payload.amount  || 0, memo: payload && payload.memo  || '' };

          // call onReadyForServerApproval shortly
          setTimeout(function(){
            try{
              if(handlers && typeof handlers.onReadyForServerApproval === 'function'){
                log('mock calling onReadyForServerApproval ->', paymentId);
                handlers.onReadyForServerApproval(paymentId);
              }
            }catch(e){ log('mock handler error (approval)', e); }
          }, 800);

          // simulate server approval + blockchain tx after another delay
          setTimeout(function(){
            try{
              var txid = 'mock-tx-' + Math.floor(Math.random()*1000000);
              if(handlers && typeof handlers.onReadyForServerCompletion === 'function'){
                log('mock calling onReadyForServerCompletion ->', paymentId, txid);
                handlers.onReadyForServerCompletion(paymentId, txid);
              }
            }catch(e){ log('mock handler error (completion)', e); }
          }, 2200);
        // return the mock payment object synchronously as some SDKs do
          return paymentObj;
        };

        return mock;
      }());
    } else {
      log('Real Pi SDK detected. Using real SDK.');
    }

    // Now initialize SDK (real or mock)
    try{
      // For demo we use sandbox flag if real, otherwise mock.init is a noop
      if(window.Pi && typeof window.Pi.init === 'function'){
        try{
          window.Pi.init({ version: '2.0', sandbox: true });
          log('Pi.init executed.');
        }catch(e){ log('Pi.init threw', e); }
      }
      setStatus('SDK ready (demo mode: ' + (!isRealPi ? 'MOCK' : 'REAL') + '). Please login.');
    }catch(e){
      setStatus('Pi.init failed');
      log('Pi.init error', e);
    }

    // Attach real handlers (they will call mock or real Pi underneath)
    if(btnLogin) btnLogin.addEventListener('click', function(){
      setStatus('Authorizing…');
      // call Pi.authenticate (mock or real)
      try{
        var scopes = ['username','payments'];
        var authPromise = window.Pi.authenticate(scopes, function(p){ log('onIncompletePaymentFound', p); });
        if(authPromise && typeof authPromise.then === 'function'){
          authPromise.then(function(auth){
            log('AUTH OK', auth);
            setStatus('Logged in as @' + (auth && auth.user && auth.user.username ? auth.user.username : 'unknown'));
            if(btnPay) btnPay.disabled = false;
          }).catch(function(err){
            log('AUTH ERROR', err);
            setStatus('Login failed: ' + (err && err.message ? err.message : 'denied'));
          });
        } else {
          // old-style callback? unlikely, but handle
          log('Pi.authenticate did not return Promise; assuming sync auth');
          setStatus('Logged in (sync).');
          if(btnPay) btnPay.disabled = false;
        }
      }catch(e){
        log('AUTH THROW', e);
        setStatus('Login failed (throw)');
      }
    });

    if(btnPay) btnPay.addEventListener('click', function(){
      try{
        setStatus('Starting mock payment flow...');
        var payment = window.Pi.createPayment(
          { amount: 0.001, memo: 'Demo payment' },
          {
            onReadyForServerApproval: function(paymentId){
              log('onReadyForServerApproval (client):', paymentId);
              // in real flow server would approve — we just log
            },
            onReadyForServerCompletion: function(paymentId, txid){
              log('onReadyForServerCompletion (client):', paymentId, txid);
              setStatus('Payment completed (demo). TXID: ' + txid);
              alert('Demo payment completed. TXID: ' + txid);
            },
            onCancel: function(paymentId){
              log('onCancel', paymentId);
              setStatus('Payment canceled');
            },
            onError: function(err, paymentId){
              log('onError', err, paymentId);
              setStatus('Payment error');
            }
          }
        );
        log('createPayment returned', payment);
      }catch(e){
        log('createPayment throw', e);
        setStatus('Payment failed (throw)');
      }
    });

    // initial safety: disable pay until login (if you want)
    if(btnPay) btnPay.disabled = true;

  }); // DOMContentLoaded
})();
