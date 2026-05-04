const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const MAX_CONTENTS = 24;
const MAX_TOTAL_TEXT_CHARS = 32 * 1024;

// Server-controlled safety policy — clients cannot weaken this through the proxy.
const DEFAULT_SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

function getAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return null;

  const host = req.headers.host;
  if (host && (origin === `https://${host}` || origin === `http://${host}`)) {
    return origin;
  }

  const allowList = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowList.includes(origin)) {
    return origin;
  }

  return null;
}

module.exports = async function handler(req, res) {
  const allowedOrigin = getAllowedOrigin(req);

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.status(allowedOrigin ? 204 : 403).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Browsers always send Origin on POST; require it to match an allowed origin
  // so the deployed proxy cannot be used as a free Gemini relay by third parties.
  if (req.headers.origin && !allowedOrigin) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  if (!req.headers.origin) {
    return res.status(403).json({ error: 'Missing Origin header' });
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

  if (body.contents.length > MAX_CONTENTS) {
    return res.status(413).json({ error: 'Too many message turns.' });
  }

  let totalTextLen = 0;
  for (const turn of body.contents) {
    const parts = Array.isArray(turn?.parts) ? turn.parts : [];
    for (const part of parts) {
      if (typeof part?.text === 'string') {
        totalTextLen += part.text.length;
        if (totalTextLen > MAX_TOTAL_TEXT_CHARS) {
          return res.status(413).json({ error: 'Request too large.' });
        }
      }
    }
  }

  try {
    const upstream = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: body.contents,
        generationConfig: body.generationConfig,
        safetySettings: DEFAULT_SAFETY_SETTINGS,
      }),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (error) {
    console.error('Gemini proxy error:', error);
    return res.status(502).json({ error: 'Upstream error' });
  }
};

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
