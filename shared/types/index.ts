/**
 * Shared types used across frontend and backend
 */

import { Mode, MessageRole, DebateStance } from '../enums/index.js';

export { Mode, MessageRole, DebateStance };

export interface Message {
  role: MessageRole;
  content: string;
  mode?: Mode;
  timestamp?: Date;
}

export interface ChatRequest {
  message: string;
  mode: Mode;
  topic?: string;
  speaker?: string;
}

export interface ChatResponse {
  response: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export interface AnthropicMessage {
  role: MessageRole;
  content: string;
}

export interface AnthropicResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  id: string;
  model: string;
  role: string;
}

export interface AppConfig {
  apiUrl: string;
  apiPort: number;
  anthropicModel: string;
  maxTokens: number;
}
