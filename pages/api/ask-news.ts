import type { NextApiRequest, NextApiResponse } from 'next';
import http from 'http';
import https from 'https';

const ASK_API_URL = process.env.NEXT_PUBLIC_ASK_API_URL || 'http://localhost:8004/ask';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  const url = new URL(ASK_API_URL);
  const client = url.protocol === 'https:' ? https : http;
  const postData = JSON.stringify({ query });

  const proxyReq = client.request(
    {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    },
    (proxyRes) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.status(proxyRes.statusCode || 200);

      // Pipe the upstream response directly to the client
      proxyRes.on('data', (chunk: Buffer) => {
        res.write(chunk);
        // Flush immediately for streaming
        if (typeof (res as any).flush === 'function') {
          (res as any).flush();
        }
      });

      proxyRes.on('end', () => {
        res.end();
      });

      proxyRes.on('error', () => {
        res.end();
      });
    }
  );

  proxyReq.on('error', () => {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to connect to news API' });
    } else {
      res.end();
    }
  });

  proxyReq.write(postData);
  proxyReq.end();
}
