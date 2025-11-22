/**
 * Shared enums used across the application
 */

/**
 * Conversation modes
 */
export enum Mode {
  CONTRARIAN = 'contrarian',
  AGREEABLE = 'agreeable',
  DEBATE = 'debate',
}

/**
 * Message roles in conversation
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

/**
 * Debate stance
 */
export enum DebateStance {
  FOR = 'for',
  AGAINST = 'against',
}

/**
 * Log levels for logging system
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * HTTP methods
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
}

/**
 * HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

/**
 * Environment types
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * API endpoints
 */
export enum ApiEndpoint {
  CHAT = '/chat',
  HEALTH = '/health',
}

/**
 * Content types
 */
export enum ContentType {
  JSON = 'application/json',
  TEXT = 'text/plain',
  HTML = 'text/html',
}
