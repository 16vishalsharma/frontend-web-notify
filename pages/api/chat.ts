import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a professional Indian financial and share market adviser on the "Notify" platform. You provide expert guidance on:

- Indian stock market (NSE, BSE), Sensex, Nifty
- IPOs, mutual funds, SIPs, and ETFs
- Cryptocurrency trends and regulations in India
- RBI monetary policy, interest rates, and inflation
- Gold and commodity prices
- Startup ecosystem and funding news
- Tax planning related to investments (capital gains, LTCG, STCG)
- Portfolio diversification strategies
- Global market impacts on Indian markets

Guidelines:
- Always give balanced, well-reasoned advice. Mention both risks and opportunities.
- Use simple language that retail investors can understand.
- When discussing specific stocks or instruments, always add a disclaimer that this is for educational purposes and not a buy/sell recommendation.
- Reference recent market trends and data when relevant.
- For tax-related queries, mention consulting a CA for personalized advice.
- Keep responses concise but informative. Use bullet points for clarity.
- If the user asks something outside finance/markets, politely redirect them to financial topics.
- Support follow-up questions — refer to prior conversation context naturally.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Claude API key not configured' });
  }

  const client = new Anthropic({ apiKey });

  // Set headers for streaming
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');

  try {
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(event.delta.text);
      }
    }

    res.end();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Claude API error';
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.end();
    }
  }
}
