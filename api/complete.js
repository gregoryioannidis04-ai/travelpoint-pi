// /api/complete.js
module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        ok: true,
        route: '/api/complete',
        method: 'GET',
        hasEnv: Boolean(process.env.PI_API_KEY),
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { paymentId, txid } = req.body || {};
    if (!paymentId || !txid) {
      return res.status(400).json({ error: 'Missing paymentId or txid' });
    }

    const response = await fetch(https://api.minepi.com/v2/payments/${paymentId}/complete, {
      method: 'POST',
      headers: {
        Authorization: Key ${process.env.PI_API_KEY},
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('complete error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
