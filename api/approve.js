// /api/approve.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const paymentId = body?.paymentId;
    if (!paymentId) return res.status(400).json({ error: "Missing paymentId" });

    const r = await fetch(https://api.minepi.com/v2/payments/${paymentId}/approve, {
      method: "POST",
      headers: {
        "Authorization": Key ${process.env.CLIENT_KEY},
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json(data);

    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error("approve error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
