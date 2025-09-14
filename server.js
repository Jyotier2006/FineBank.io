// server.js
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// Root route to show a friendly message
app.get('/', (_req, res) => {
  res.type('text/plain').send(
    '✅ SpeakToMoney API running.\nPOST /api/ask with JSON: { question, context }'
  );
});

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10000, // 10s server-side timeout so requests don’t hang
});

app.post('/api/ask', async (req, res) => {
  const { question, context } = req.body || {};
  if (!question) return res.status(400).json({ ok: false, error: 'Missing question' });

  try {
    const prompt = `You are a helpful financial assistant for an Indian user.
Use only the JSON context provided when answering.

Context (JSON):
${JSON.stringify(context || {}, null, 2)}

Question: ${question}`;

    const resp = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
    });

    const text =
      resp.output_text ||
      resp.choices?.[0]?.message?.content?.[0]?.text ||
      'No response';

    return res.json({ ok: true, text });
  } catch (err) {
    const status = err?.status || err?.response?.status || 500;
    const code   = err?.code || err?.error?.code || 'unknown_error';

    const msg =
      code === 'insufficient_quota' || status === 429
        ? 'AI unavailable: insufficient quota on your OpenAI project. Add billing or use a different API key.'
        : (err?.error?.message || err?.message || 'AI error');

    console.error('OpenAI error:', {
      status, code, msg, request_id: err?.request_id,
    });

    return res.status(status).json({ ok: false, error: msg, code, status });
  }
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`API up on http://localhost:${PORT}`);
});
