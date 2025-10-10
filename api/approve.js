// api/approve.js  — CommonJS

module.exports = async function handler(req, res) {
  // Быстрый пинг, чтобы убедиться что рантайм жив и переменная есть
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      route: '/api/approve',
      method: 'GET',
      hasEnv: !!process.env.PI_SERVER_API_KEY
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const { paymentId } = req.body || {};
    if (!paymentId) {
      return res.status(400).json({ ok: false, error: 'missing_paymentId' });
    }

    // ⬇️⬇️⬇️ ОБРАТНЫЕ КАВЫЧКИ ОБЯЗАТЕЛЬНО ⬇️⬇️⬇️
    const url =    'https://api.minepi.com/v3/payments/${paymentId}/approve';

    let r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          // ⬇️⬇️⬇️ здесь тоже backticks ⬇️⬇️⬇️
          'Authorization': 'Key ${process.env.PI_SERVER_API_KEY}',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
    } catch (err) {
      return res.status(502).json({ ok: false, error: 'fetch_failed', message: String(err) });
    }

    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({
        ok: false,
        error: 'pi_api_error',
        status: r.status,
        body: text
      });
    }

    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(200).json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'server_error', message: String(e) });
  }
};
