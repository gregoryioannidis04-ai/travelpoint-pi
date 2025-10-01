// /api/approve.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { paymentId } = body || {};
    if (!paymentId) return res.status(400).json({ error: "Missing paymentId" });

    // Запрос к Pi Platform API: approve
    const r = await fetch(https://api.minepi.com/v2/payments/${paymentId}/approve, {
      method: "POST",
      headers: {
        Authorization: Key ${process.env.CLIENT_KEY}, // переменная в Vercel
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ error: "Pi API error (approve)", details: data });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
