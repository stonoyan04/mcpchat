/**
 * MCP (Model Context Protocol) Server for MCP Chat
 * Provides tools for contrarian and agreeable conversation modes
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Mode } from '../shared/enums/index.js';
import { SYSTEM_PROMPTS, MODE_CONFIG } from '../shared/constants/index.js';
import { isNonEmptyString } from '../shared/utils/validation.js';
import { logger } from '../shared/utils/logger.js';

/**
 * Define MCP tools for different conversation modes
 */
const tools: Tool[] = [
  {
    name: MODE_CONFIG[Mode.CONTRARIAN].name,
    description: MODE_CONFIG[Mode.CONTRARIAN].description,
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
    name: MODE_CONFIG[Mode.AGREEABLE].name,
    description: MODE_CONFIG[Mode.AGREEABLE].description,
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

/**
 * Initialize MCP server
 */
function createMCPServer(): Server {
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

  // Handle tool listing requests
  server.setRequestHandler(ListToolsRequestSchema, () => {
    logger.debug('Received tools list request');
    return { tools };
  });

  // Handle tool execution requests
  server.setRequestHandler(CallToolRequestSchema, (request) => {
    const { name, arguments: args } = request.params;
    logger.debug('Received tool call request', { tool: name });

    // Validate arguments
    const message = (args as { message?: string })?.message;
    if (!isNonEmptyString(message)) {
      throw new Error('Invalid message: must be a non-empty string');
    }

    // Handle contrarian mode
    if (name === (Mode.CONTRARIAN as string)) {
      return {
        content: [
          {
            type: 'text',
            text: `${SYSTEM_PROMPTS[Mode.CONTRARIAN]}\n\nUser statement: "${message}"\n\nProvide a thoughtful counterargument or alternative perspective.`,
          },
        ],
      };
    }

    // Handle agreeable mode
    if (name === (Mode.AGREEABLE as string)) {
      return {
        content: [
          {
            type: 'text',
            text: `${SYSTEM_PROMPTS[Mode.AGREEABLE]}\n\nUser statement: "${message}"\n\nProvide supportive validation and build upon this idea.`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  return server;
}

/**
 * Start the MCP server
 */
async function startMCPServer(): Promise<void> {
  try {
    const server = createMCPServer();
    const transport = new StdioServerTransport();

    await server.connect(transport);

    logger.info('MCP Chat server running on stdio');
    logger.debug(
      'Available tools:',
      tools.map((t) => t.name)
    );
  } catch (error) {
    logger.error('Failed to start MCP server', error);
    process.exit(1);
  }
}

// Start the server
startMCPServer().catch((error) => {
  logger.error('Unhandled error in MCP server', error);
  process.exit(1);
});
