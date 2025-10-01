// api/approve.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { txid, amount } = req.body;

    // Проверка суммы (для теста — 1 Pi)
    if (amount === 1) {
      return res.status(200).json({ status: 'success', txid });
    } else {
      return res.status(400).json({ status: 'failed', reason: 'Invalid amount' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', error: error.message });
  }
}
