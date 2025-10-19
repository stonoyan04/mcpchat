import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

const CONTRARIAN_PROMPT = `You are a sharp, critical thinker who challenges every statement with logical counterarguments.
Your role is to find flaws, present alternative perspectives, and question assumptions.
Be intellectually rigorous but respectful. Focus on constructive disagreement that helps people think deeper.`;

const AGREEABLE_PROMPT = `You are a warm, supportive conversationalist who validates and builds upon what people say.
Your role is to find merit in their ideas, offer encouragement, and expand on their thoughts positively.
Be genuine and thoughtful in your agreement, adding value rather than just echoing.`;

const tools: Tool[] = [
  {
    name: 'contrarian_mode',
    description: 'Engage in critical thinking mode - challenges and questions the input',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The user message to analyze critically',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'agreeable_mode',
    description: 'Engage in supportive mode - validates and builds upon the input',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The user message to support and expand upon',
        },
      },
      required: ['message'],
    },
  },
];

const server = new Server(
  {
    name: 'mcpchat',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'contrarian_mode') {
    const message = (args as { message: string }).message;
    return {
      content: [
        {
          type: 'text',
          text: `${CONTRARIAN_PROMPT}\n\nUser statement: "${message}"\n\nProvide a thoughtful counterargument or alternative perspective.`,
        },
      ],
    };
  }

  if (name === 'agreeable_mode') {
    const message = (args as { message: string }).message;
    return {
      content: [
        {
          type: 'text',
          text: `${AGREEABLE_PROMPT}\n\nUser statement: "${message}"\n\nProvide supportive validation and build upon this idea.`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Chat server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
