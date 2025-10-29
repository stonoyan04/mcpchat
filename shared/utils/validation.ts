/**
 * Validation utilities for input sanitization and validation
 */

import { Mode } from '../enums/index.js';
import { ERROR_MESSAGES } from '../constants/index.js';

/**
 * Validate that a string is not empty
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate that a value is a valid Mode
 */
export function isValidMode(value: unknown): value is Mode {
  return value === Mode.CONTRARIAN || value === Mode.AGREEABLE;
}

/**
 * Sanitize user input by trimming and limiting length
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input.trim().slice(0, maxLength);
}

/**
 * Validate chat request payload
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateChatRequest(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { message, mode } = data as Record<string, unknown>;

  if (!isNonEmptyString(message)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_MESSAGE };
  }

  if (!isValidMode(mode)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_MODE };
  }

  return { valid: true };
}

/**
 * Validate environment configuration
 */
export function validateEnvironment(requiredVars: string[]): ValidationResult {
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required environment variables: ${missing.join(', ')}`,
    };
  }

  return { valid: true };
}
