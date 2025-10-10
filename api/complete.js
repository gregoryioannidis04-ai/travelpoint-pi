export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      route: "/api/complete",
      method: "GET",
      hasEnv: !!process.env.PI_API_KEY,
    });
  }

  if (req.method === "POST") {
    try {
      const body = req.body && Object.keys(req.body).length
        ? req.body
        : JSON.parse(req.body || "{}");

      // Здесь обычно подтверждают перевод в Pi API (complete)
      return res.status(200).json({
        ok: true,
        route: "/api/complete",
        method: "POST",
        received: body || null,
        note: "stub complete: returned 200",
      });
    } catch {
      return res.status(200).json({
        ok: true,
        route: "/api/complete",
        method: "POST",
        note: "stub complete with parse fallback",
      });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
