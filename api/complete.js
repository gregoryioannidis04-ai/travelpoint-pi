module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    let body = {};
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch (e) {
      console.error("complete: JSON parse error", e);
    }

    const { paymentId, txid } = body || {};
    if (!paymentId || !txid) {
      console.error("complete: Missing paymentId or txid", body);
      return res.status(400).json({ error: "Missing paymentId or txid" });
    }

    const key = process.env.CLIENT_KEY || process.env.PI_API_KEY;
    if (!key) {
      console.error("complete: Missing CLIENT_KEY / PI_API_KEY");
      return res.status(500).json({ error: "Missing API key" });
    }

    const response = await fetch(https://api.minepi.com/v2/payments/${paymentId}/complete, {
      method: "POST",
      headers: {
        Authorization: Key ${key},
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    const text = await response.text();
    console.log("complete:", response.status, text);
    return res.status(response.status).send(text);
  } catch (error) {
    console.error("complete: exception", error);
    return res.status(500).json({ error: error.message });
  }
};
