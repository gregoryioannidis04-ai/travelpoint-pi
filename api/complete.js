export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { paymentId, txid } = req.body || {};
    if (!paymentId || !txid) {
      return res.status(400).json({ error: 'paymentId and txid required' });
    }

    const r = await fetch(https://api.minepi.com/v2/payments/${paymentId}/complete, {
      method: 'POST',
      headers: {
        'Authorization': Key ${process.env.PI_API_KEY},
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    const data = await r.json();
    return res.status(r.ok ? 200 : 400).json(data);
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'complete failed' });
  }
}
