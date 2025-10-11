const qs = require('querystring');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body; // уже распарсено Vercel
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return qs.parse(raw); }
}

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Health-check
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true, route: '/api/approve', method: 'GET',
      hasEnv: !!process.env.PI_API_KEY
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = await readBody(req);
    const paymentId = body.paymentId || body.payment_id || body.paymentID;
    const txid = body.txid || body.txId || body.transaction_id;

    if (!paymentId || !txid) {
      return res.status(400).json({
        error: 'Missing paymentId or txid',
        received: body,
        hint: 'Убедись, что клиент шлёт JSON { paymentId, txid } и заголовок Content-Type: application/json'
      });
    }

    const r = await fetch('https://api.minepi.com/v2/payments/${paymentId}/approve', {
      method: 'POST',
      headers: {
        Authorization: 'Key ' + process.env.PI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    let data;
    try { data = await r.json(); } catch { data = { raw: await r.text() }; }

    return res.status(r.status).json({
      ok: r.ok, status: r.status,
      pi: data
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
