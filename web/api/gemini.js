const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing GEMINI_API_KEY. Set it in the Vercel project Environment Variables.',
    });
  }

  const body = typeof req.body === 'string' ? safeJsonParse(req.body) : req.body;
  if (!body || !Array.isArray(body.contents)) {
    return res.status(400).json({ error: 'Invalid request: expected JSON body with contents[] array.' });
  }

  try {
    const upstream = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: body.contents,
        generationConfig: body.generationConfig,
        safetySettings: body.safetySettings,
      }),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (error) {
    console.error('Gemini proxy error:', error);
    return res.status(502).json({ error: error.message || 'Upstream error' });
  }
};

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
