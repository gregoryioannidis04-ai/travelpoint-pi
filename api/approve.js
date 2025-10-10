// pages/api/approve.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const { paymentId } = req.body || {};
  if (!paymentId) {
    return res.status(400).json({ ok: false, error: 'missing_paymentId' });
  }

  const url = https://api.minepi.com/v3/payments/${paymentId}/approve;
  const auth = Key ${process.env.PI_SERVER_API_KEY};

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const text = await r.text();
    return res
      .status(r.status)
      .json({
        ok: r.ok,
        status: r.status,
        url,
        authPresent: !!process.env.PI_SERVER_API_KEY,
        body: safeJson(text),
      });
  } catch (e) {
    return res
      .status(502)
      .json({
        ok: false,
        error: 'fetch_failed',
        url,
        message: String(e),
        authPresent: !!process.env.PI_SERVER_API_KEY,
      });
  }
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return { raw: s }; }
}
