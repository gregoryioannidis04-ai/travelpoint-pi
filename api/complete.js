// pages/api/complete.js  (для App Router адаптируйте под route.js)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const { paymentId } = req.body || {};
    if (!paymentId) {
      return res.status(400).json({ error: 'missing_paymentId' });
    }

    const r = await fetch(https://api.minepi.com/v2/payments/${paymentId}/complete, {
      method: 'POST',
      headers: {
        'Authorization': Key ${process.env.PI_SERVER_API_KEY},
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const text = await r.text(); // на случай, если не JSON
    if (!r.ok) {
      return res.status(r.status).json({ error: 'pi_api_error', body: text });
    }
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(200).json({ ok: true, data });
  } catch (e) {
    return res.status(500).json({ error: 'server_error', message: String(e) });
  }
}
