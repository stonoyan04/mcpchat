/**
 * AI Service for handling Anthropic API interactions
 */

import { Mode } from '../../shared/enums/index.js';
import type { AnthropicResponse, AnthropicMessage } from '../../shared/types/index.js';
import { SYSTEM_PROMPTS, ERROR_MESSAGES } from '../../shared/constants/index.js';
import { sanitizeInput } from '../../shared/utils/validation.js';
import { logger } from '../../shared/utils/logger.js';
import { config } from '../config/index.js';
import { AIServiceError } from '../errors/ai-service.error.js';

/**
 * AI Service class for generating responses
 */
export class AIService {
  /**
   * Generate a response using the Anthropic API
   */
  async generateResponse(message: string, mode: Mode): Promise<string> {
    const sanitizedMessage = sanitizeInput(message);

    if (!sanitizedMessage) {
      throw new AIServiceError(ERROR_MESSAGES.INVALID_MESSAGE, 400);
    }

    // Return mock response if API key is not configured
    if (!config.anthropicApiKey) {
      logger.warn('API key not configured, returning mock response');
      return this.getMockResponse(mode);
    }

    const systemPrompt = this.getSystemPrompt(mode);

    try {
      logger.debug('Sending request to Anthropic API', {
        mode,
        messageLength: sanitizedMessage.length,
      });

      const response = await fetch(config.anthropicApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.anthropicApiKey,
          'anthropic-version': config.anthropicVersion,
        },
        body: JSON.stringify({
          model: config.anthropicModel,
          max_tokens: config.maxTokens,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: sanitizedMessage,
            } as AnthropicMessage,
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error('Anthropic API error', { status: response.status, body: errorBody });
        throw new AIServiceError(ERROR_MESSAGES.API_REQUEST_FAILED, response.status, errorBody);
      }

      const data = (await response.json()) as AnthropicResponse;
      const responseText = data.content[0]?.text;

      if (!responseText) {
        throw new AIServiceError('No response text received from API');
      }

      logger.debug('Successfully received AI response', {
        responseLength: responseText.length,
        model: data.model,
      });

      return responseText;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      logger.error('Failed to generate AI response', error);
      throw new AIServiceError(
        ERROR_MESSAGES.API_REQUEST_FAILED,
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get the appropriate system prompt for the mode
   */
  private getSystemPrompt(mode: Mode): string {
    return SYSTEM_PROMPTS[mode];
  }

  /**
   * Get a mock response when API key is not configured
   */
  private getMockResponse(mode: Mode): string {
    return mode === Mode.CONTRARIAN
      ? `I'd challenge that assumption, but I'm not properly configured yet. Set ANTHROPIC_API_KEY to enable real AI responses.`
      : `I'd love to expand on that, but I need proper configuration first. Set ANTHROPIC_API_KEY to enable real AI responses.`;
  }
}

// Export singleton instance
export const aiService = new AIService();
