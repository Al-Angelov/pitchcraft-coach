// api/transcribe.js - Serverless proxy for Whisper transcription
// Keeps OPENAI_API_KEY on the server; client sends audio blob here.

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'Server misconfigured: missing API key.' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ success: false, error: 'Expected multipart/form-data.' });
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': contentType
      },
      body: body
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, text: data.text });
    } else if (response.status === 401) {
      return res.status(401).json({ success: false, error: 'Invalid API key.', statusCode: 401 });
    } else if (response.status === 429) {
      return res.status(429).json({ success: false, error: 'Rate limit reached. Try again later.', statusCode: 429 });
    } else {
      return res.status(response.status).json({
        success: false,
        error: `Transcription failed (HTTP ${response.status}).`,
        statusCode: response.status
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error during transcription.' });
  }
}
