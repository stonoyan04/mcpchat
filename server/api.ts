/**
 * HTTP API Server for MCP Chat
 * Handles chat requests and routes them to the AI service
 */

import type { IncomingMessage, ServerResponse } from 'http';
import { createServer } from 'http';
import { parse } from 'url';
import type { ChatRequest, ChatResponse, ErrorResponse } from '../shared/types/index.js';
import { HttpMethod, ApiEndpoint, ContentType } from '../shared/enums/index.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../shared/constants/index.js';
import { validateChatRequest } from '../shared/utils/validation.js';
import { logger } from '../shared/utils/logger.js';
import { config } from './config/index.js';
import { aiService } from './services/ai.service.js';
import { AIServiceError } from './errors/ai-service.error.js';

/**
 * Set CORS headers on response
 */
function setCORSHeaders(res: ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    `${HttpMethod.POST}, ${HttpMethod.GET}, ${HttpMethod.OPTIONS}`
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Send JSON response
 */
function sendJSON(res: ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, { 'Content-Type': ContentType.JSON });
  res.end(JSON.stringify(data));
}

/**
 * Handle OPTIONS preflight requests
 */
function handleOptions(res: ServerResponse): void {
  setCORSHeaders(res);
  res.writeHead(HTTP_STATUS.OK);
  res.end();
}

/**
 * Handle health check endpoint
 */
function handleHealthCheck(res: ServerResponse): void {
  setCORSHeaders(res);
  sendJSON(res, HTTP_STATUS.OK, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: !!config.anthropicApiKey,
  });
}

/**
 * Handle chat endpoint
 */
function handleChat(req: IncomingMessage, res: ServerResponse): void {
  let body = '';

  req.on('data', (chunk: Buffer) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    void (async () => {
      try {
        // Parse and validate request
        const data = JSON.parse(body) as unknown;
        const validation = validateChatRequest(data);

        if (!validation.valid) {
          logger.warn('Invalid chat request', { error: validation.error });
          const errorResponse: ErrorResponse = {
            error: validation.error || ERROR_MESSAGES.INVALID_MESSAGE,
          };
          sendJSON(res, HTTP_STATUS.BAD_REQUEST, errorResponse);
          return;
        }

        const { message, mode, topic, speaker } = data as ChatRequest;
        logger.info('Processing chat request', { mode, messageLength: message.length, topic, speaker });

        // Generate AI response
        const response = await aiService.generateResponse(message, mode, topic, speaker);

        const successResponse: ChatResponse = { response };
        sendJSON(res, HTTP_STATUS.OK, successResponse);
        logger.info('Successfully processed chat request');
      } catch (error) {
        if (error instanceof SyntaxError) {
          logger.warn('Invalid JSON in request body');
          const errorResponse: ErrorResponse = { error: 'Invalid JSON' };
          sendJSON(res, HTTP_STATUS.BAD_REQUEST, errorResponse);
        } else if (error instanceof AIServiceError) {
          logger.error('AI service error', error);
          const errorResponse: ErrorResponse = {
            error: error.message,
            details: error.details,
          };
          sendJSON(res, error.statusCode || HTTP_STATUS.INTERNAL_ERROR, errorResponse);
        } else {
          logger.error('Unexpected error processing chat request', error);
          const errorResponse: ErrorResponse = {
            error: ERROR_MESSAGES.INTERNAL_ERROR,
          };
          sendJSON(res, HTTP_STATUS.INTERNAL_ERROR, errorResponse);
        }
      }
    })();
  });

  req.on('error', (error) => {
    logger.error('Request error', error);
    const errorResponse: ErrorResponse = { error: ERROR_MESSAGES.INTERNAL_ERROR };
    sendJSON(res, HTTP_STATUS.INTERNAL_ERROR, errorResponse);
  });
}

/**
 * Main request handler
 */
function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  const { pathname } = parse(req.url || '', true);

  setCORSHeaders(res);

  // Handle OPTIONS preflight
  if (req.method === HttpMethod.OPTIONS) {
    handleOptions(res);
    return;
  }

  // Route requests
  if (pathname === ApiEndpoint.HEALTH && req.method === HttpMethod.GET) {
    handleHealthCheck(res);
  } else if (pathname === ApiEndpoint.CHAT && req.method === HttpMethod.POST) {
    handleChat(req, res);
  } else {
    logger.warn('404 Not Found', { method: req.method, pathname });
    sendJSON(res, HTTP_STATUS.NOT_FOUND, { error: 'Not found' });
  }
}

/**
 * Start the HTTP server
 */
function startServer(): void {
  const server = createServer(handleRequest);

  server.on('error', (error) => {
    logger.error('Server error', error);
    process.exit(1);
  });

  server.listen(config.port, () => {
    logger.info(`API server running on http://localhost:${config.port}`);
    logger.info('Endpoints:', {
      chat: `http://localhost:${config.port}/chat`,
      health: `http://localhost:${config.port}/health`,
    });
  });
}

// Start the server
startServer();
