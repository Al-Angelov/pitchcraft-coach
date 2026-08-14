// api/feedback.js - Serverless proxy for GPT Chat Completions
// Keeps OPENAI_API_KEY on the server; client sends messages array here.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'Server misconfigured: missing API key.' });
  }

  try {
    const { messages, model, temperature, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing or invalid messages array.' });
    }

    const body = {
      model: model || 'gpt-4o-mini',
      temperature: temperature !== undefined ? temperature : 0.7,
      messages
    };

    if (max_tokens) {
      body.max_tokens = max_tokens;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      const content = data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : '';
      return res.status(200).json({ success: true, content });
    } else if (response.status === 401) {
      return res.status(401).json({ success: false, error: 'Invalid API key.', statusCode: 401 });
    } else if (response.status === 429) {
      return res.status(429).json({ success: false, error: 'Rate limit reached. Try again later.', statusCode: 429 });
    } else {
      return res.status(response.status).json({
        success: false,
        error: `Feedback generation failed (HTTP ${response.status}).`,
        statusCode: response.status
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error during feedback generation.' });
  }
}
