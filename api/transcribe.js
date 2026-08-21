// api/transcribe.js - Serverless proxy for Whisper transcription
// Handles large audio payloads from longer practice sessions.

// Vercel serverless config: increase body limit and execution timeout
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false
  },
  maxDuration: 60 // seconds (Pro plan allows up to 300s)
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'Server misconfigured: missing API key.' });
  }

  try {
    // Collect the raw request body
    const chunks = [];
    let totalSize = 0;
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB (Whisper's own limit)

    for await (const chunk of req) {
      totalSize += chunk.length;
      if (totalSize > MAX_SIZE) {
        return res.status(413).json({
          success: false,
          error: 'Audio file too large (max 25MB). Try a shorter recording.',
          statusCode: 413
        });
      }
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ success: false, error: 'Expected multipart/form-data.' });
    }

    // Forward to OpenAI Whisper with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55s (under our 60s maxDuration)

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': contentType
      },
      body: body,
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, text: data.text });
    } else if (response.status === 401) {
      return res.status(401).json({ success: false, error: 'Invalid API key.', statusCode: 401 });
    } else if (response.status === 413) {
      return res.status(413).json({ success: false, error: 'Audio file too large for Whisper (max 25MB).', statusCode: 413 });
    } else if (response.status === 429) {
      return res.status(429).json({ success: false, error: 'Rate limit reached. Try again later.', statusCode: 429 });
    } else {
      const errMsg = data.error && data.error.message ? data.error.message : `HTTP ${response.status}`;
      return res.status(response.status).json({
        success: false,
        error: `Transcription failed: ${errMsg}`,
        statusCode: response.status
      });
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        error: 'Transcription timed out. The audio may be too long to process in time.',
        statusCode: 504
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server error during transcription: ' + (err.message || 'Unknown error')
    });
  }
}
