// pages/api/approve.js — CommonJS
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    // безопасно читаем тело (иногда приходит как stream)
    let raw = "";
    for await (const chunk of req) raw += chunk;
    let body = {};
    try { body = JSON.parse(raw); } catch { body = {}; }

    const paymentId = body.paymentId;
    if (!paymentId) return res.status(400).json({ error: 'missing_paymentId' });

    const url = 'https://api.minepi.com/v3/payments/' + paymentId + '/approve';
    const headers = {
      'Authorization': 'Key ' + process.env.PI_SERVER_API_KEY,
      'Content-Type': 'application/json'
    };

    let r;
    try {
      r = await fetch(url, { method: 'POST', headers, body: '{}' });
    } catch (err) {
      return res.status(502).json({ error: 'fetch_failed', message: String(err), url });
    }

    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({ error: 'pi_api_error', status: r.status, body: text, url });
    }

    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return res.status(200).json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ error: 'server_error', message: String(e) });
  }
};
