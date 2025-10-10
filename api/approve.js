// /api/approve.js
module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        ok: true,
        route: '/api/approve',
        method: 'GET',
        hasEnv: Boolean(process.env.PI_API_KEY),
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { paymentId } = req.body || {};
    if (!paymentId) {
      return res.status(400).json({ error: 'Missing paymentId' });
    }

    const response = await fetch(https://api.minepi.com/v2/payments/${paymentId}/approve, {
      method: 'POST',
      headers: {
        Authorization: Key ${process.env.PI_API_KEY},
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('approve error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
