module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    let body = {};
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch (e) {
      console.error("approve: JSON parse error", e);
    }

    const paymentId = body?.paymentId;
    if (!paymentId) {
      console.error("approve: Missing paymentId", body);
      return res.status(400).json({ error: "Missing paymentId" });
    }

    const key = process.env.CLIENT_KEY || process.env.PI_API_KEY;
    if (!key) {
      console.error("approve: Missing CLIENT_KEY / PI_API_KEY");
      return res.status(500).json({ error: "Missing API key" });
    }

    const response = await fetch(https://api.minepi.com/v2/payments/${paymentId}/approve, {
      method: "POST",
      headers: {
        Authorization: Key ${key},
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const text = await response.text();
    console.log("approve:", response.status, text);
    return res.status(response.status).send(text);
  } catch (error) {
    console.error("approve: exception", error);
    return res.status(500).json({ error: error.message });
  }
};
