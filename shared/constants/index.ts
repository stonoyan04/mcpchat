/**
 * Shared constants used across the application
 */

import { Mode, HttpStatus } from '../enums/index.js';

/**
 * System prompts for different AI modes
 */
export const SYSTEM_PROMPTS: Record<Mode, string> = {
  [Mode.CONTRARIAN]: `You are a sharp, critical thinker who challenges statements with logical counterarguments.
Find flaws, present alternative perspectives, and question assumptions.
Be intellectually rigorous but respectful. Provide constructive disagreement that helps people think deeper.
Keep responses concise and focused on the specific point being made.`,

  [Mode.AGREEABLE]: `You are a warm, supportive conversationalist who validates and builds upon what people say.
Find genuine merit in their ideas, offer encouragement, and expand on their thoughts positively.
Be thoughtful in your agreement, adding real value rather than just echoing.
Keep responses concise and authentically supportive.`,

  [Mode.DEBATE]: `You are simulating a debate between two AI personalities discussing a topic.

AI-1 (Proponent): Argues FOR the topic with supportive, optimistic arguments
AI-2 (Opponent): Argues AGAINST the topic with critical, cautious counterpoints

You will be told which speaker should speak next. Generate ONLY that speaker's statement.

Format: Start with the speaker label, then their statement (2-3 complete sentences).

Example for AI-1:
AI-1: [Supporting argument about the topic]

Example for AI-2:
AI-2: [Counter-argument about the topic]

CRITICAL RULES:
1. Generate ONLY the specified speaker's statement
2. Always write 2-3 COMPLETE sentences
3. NEVER end mid-sentence
4. Make each point substantive and engaging`,
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  DEFAULT_PORT: 3001,
  DEFAULT_CLIENT_PORT: 3000,
  ANTHROPIC_API_URL: 'https://api.anthropic.com/v1/messages',
  ANTHROPIC_VERSION: '2023-06-01',
  DEFAULT_MODEL: 'claude-3-5-haiku-20241022',
  DEFAULT_MAX_TOKENS: 300,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'ANTHROPIC_API_KEY is not configured',
  API_REQUEST_FAILED: 'Failed to communicate with AI service',
  INVALID_MODE: 'Invalid mode specified',
  INVALID_MESSAGE: 'Message content is required',
  INTERNAL_ERROR: 'An internal error occurred',
  NETWORK_ERROR: 'Network error occurred',
} as const;

/**
 * Mode configurations
 */
export const MODE_CONFIG = {
  [Mode.CONTRARIAN]: {
    name: Mode.CONTRARIAN,
    label: 'Contrarian',
    icon: '⚡',
    description: 'Critical thinking mode - challenges and questions',
  },
  [Mode.AGREEABLE]: {
    name: Mode.AGREEABLE,
    label: 'Agreeable',
    icon: '💫',
    description: 'Supportive mode - validates and builds upon',
  },
  [Mode.DEBATE]: {
    name: Mode.DEBATE,
    label: 'Debate',
    icon: '🎭',
    description: 'Self-debate mode - generates both questions and answers',
  },
} as const;

/**
 * HTTP Status codes (re-export from enums)
 */
export const HTTP_STATUS = {
  OK: HttpStatus.OK,
  BAD_REQUEST: HttpStatus.BAD_REQUEST,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  INTERNAL_ERROR: HttpStatus.INTERNAL_ERROR,
} as const;
