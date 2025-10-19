import { createServer } from 'http';
import { parse } from 'url';
import 'dotenv/config';

const CONTRARIAN_SYSTEM = `You are a sharp, critical thinker who challenges statements with logical counterarguments.
Find flaws, present alternative perspectives, and question assumptions.
Be intellectually rigorous but respectful. Provide constructive disagreement that helps people think deeper.
Keep responses concise and focused on the specific point being made.`;

const AGREEABLE_SYSTEM = `You are a warm, supportive conversationalist who validates and builds upon what people say.
Find genuine merit in their ideas, offer encouragement, and expand on their thoughts positively.
Be thoughtful in your agreement, adding real value rather than just echoing.
Keep responses concise and authentically supportive.`;

interface ChatRequest {
  message: string;
  mode: 'contrarian' | 'agreeable';
}

interface AnthropicResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

async function generateResponse(message: string, mode: 'contrarian' | 'agreeable'): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return mode === 'contrarian'
      ? `I'd challenge that assumption, but I'm not properly configured yet. Set ANTHROPIC_API_KEY to enable real AI responses.`
      : `I'd love to expand on that, but I need proper configuration first. Set ANTHROPIC_API_KEY to enable real AI responses.`;
  }

  const systemPrompt = mode === 'contrarian' ? CONTRARIAN_SYSTEM : AGREEABLE_SYSTEM;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Details:', errorBody);
      throw new Error(`API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json() as AnthropicResponse;
    return data.content[0].text;
  } catch (error) {
    console.error('AI generation error:', error);
    return mode === 'contrarian'
      ? `While I'd normally challenge this, I'm experiencing technical difficulties. Please try again.`
      : `I appreciate your input, though I'm having technical issues responding properly right now.`;
  }
}

const server = createServer(async (req, res) => {
  const { pathname } = parse(req.url || '', true);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/chat' && req.method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { message, mode }: ChatRequest = JSON.parse(body);
        const response = await generateResponse(message, mode);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
