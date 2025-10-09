// sanity-test
module.exports = async function handler(req, res) {
  try {
    return res.status(200).json({
      ok: true,
      route: "/api/complete",
      method: req.method,
      hasEnv: !!process.env.PI_SERVER_API_KEY
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
