/**
 * API Service for frontend HTTP communication
 */

import type { Mode, ChatRequest, ChatResponse, ErrorResponse } from '../../shared/types/index.js';
import { ERROR_MESSAGES } from '../../shared/constants/index.js';
import { sanitizeInput } from '../../shared/utils/validation.js';
import { logger } from '../../shared/utils/logger.js';
import { clientConfig } from '../config/index.js';
import { APIError } from '../errors/api.error.js';

/**
 * API Service class for making HTTP requests
 */
export class APIService {
  private baseUrl: string;

  constructor(baseUrl: string = clientConfig.apiUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a chat message to the backend
   */
  async sendMessage(message: string, mode: Mode): Promise<string> {
    const sanitizedMessage = sanitizeInput(message);

    if (!sanitizedMessage) {
      throw new APIError(ERROR_MESSAGES.INVALID_MESSAGE, 400);
    }

    const requestBody: ChatRequest = {
      message: sanitizedMessage,
      mode,
    };

    try {
      logger.debug('Sending chat request', { mode, messageLength: sanitizedMessage.length });

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw new APIError(
          errorData.error || ERROR_MESSAGES.API_REQUEST_FAILED,
          response.status,
          errorData.details
        );
      }

      const data = (await response.json()) as ChatResponse;

      if (!data.response) {
        throw new APIError('Invalid response format from server');
      }

      logger.debug('Successfully received response', {
        responseLength: data.response.length,
      });

      return data.response;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      // Handle network errors
      logger.error('Network error occurred', error);
      throw new APIError(
        ERROR_MESSAGES.NETWORK_ERROR,
        0,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Parse error response from server
   */
  private async parseErrorResponse(response: Response): Promise<ErrorResponse> {
    try {
      const data: unknown = await response.json();
      return data as ErrorResponse;
    } catch {
      return {
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        details: `HTTP ${response.status}`,
      };
    }
  }

  /**
   * Check if the API server is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new APIService();
