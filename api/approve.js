export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { paymentId } = req.body || {};
      if (!paymentId) {
        return res.status(400).json({ error: "Missing paymentId" });
      }

      const response = await fetch(https://api.minepi.com/v2/payments/${paymentId}/approve, {
        method: "POST",
        headers: {
          "Authorization": Key ${process.env.PI_API_KEY},
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, route: "/api/approve", method: "GET" });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
