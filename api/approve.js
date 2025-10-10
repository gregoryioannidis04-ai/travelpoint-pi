export default async function handler(req, res) {
  // Health-check
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      route: "/api/approve",
      method: "GET",
      hasEnv: !!process.env.PI_API_KEY,
    });
  }

  // ✅ Главное — принимать POST от кошелька
  if (req.method === "POST") {
    try {
      // Если Vercel не распарсил тело — подстрахуемся
      const body = req.body && Object.keys(req.body).length
        ? req.body
        : JSON.parse(req.body || "{}");

      // На этом шаге вы обычно обращаетесь к Pi API с paymentId
      // Здесь делаем заглушку-одобрение, чтобы не было 404
      return res.status(200).json({
        ok: true,
        route: "/api/approve",
        method: "POST",
        received: body || null,
        note: "stub approve: returned 200",
      });
    } catch (e) {
      // Даже при ошибке парсинга вернём 200, чтобы кошелёк не падал
      return res.status(200).json({
        ok: true,
        route: "/api/approve",
        method: "POST",
        note: "stub approve with parse fallback",
      });
    }
  }

  // Любой другой метод
  return res.status(405).json({ error: "Method Not Allowed" });
}
