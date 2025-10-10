// /api/approve.js
module.exports = async function handler(req, res) {
  // Пинг эндпоинт, чтобы проверять живость
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      route: '/api/approve',
      method: 'GET',
      hasEnv: !!process.env.PI_SERVER_API_KEY,
      node: process.versions.node
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const startedAt = Date.now();
  const payload = req.body || {};
  const paymentId = payload.paymentId;

  if (!paymentId) {
    return res.status(400).json({ error: 'missing_paymentId' });
  }
  if (!process.env.PI_SERVER_API_KEY) {
    return res.status(500).json({ error: 'missing_env_PI_SERVER_API_KEY' });
  }

  const url = https://api.minepi.com/v3/payments/${paymentId}/approve;

  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': Key ${process.env.PI_SERVER_API_KEY},
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
  } catch (err) {
    // сетевые/рантайм ошибки
    console.error('approve fetch error:', err);
    return res.status(502).json({
      error: 'fetch_failed',
      message: String(err),
      url
    });
  }

  const text = await resp.text();
  if (!resp.ok) {
    // логируем тело ответа для диагностики
    console.error('approve non-OK:', resp.status, text);
    return res.status(resp.status).json({
      error: 'pi_api_error',
      status: resp.status,
      url,
      body: text
    });
  }

  let data;
  try { data = JSON.parse(text); } catch (_) { data = { raw: text }; }

  return res.status(200).json({
    ok: true,
    approved: true,
    paymentId,
    piResponse: data,
    tookMs: Date.now() - startedAt
  });
};
