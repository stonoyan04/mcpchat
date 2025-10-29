/**
 * Server configuration with environment validation
 */

import 'dotenv/config';
import { Environment } from '../../shared/enums/index.js';
import { API_CONFIG } from '../../shared/constants/index.js';
import { logger } from '../../shared/utils/logger.js';
import { ServerConfig } from '../types/config.types.js';

/**
 * Load and validate server configuration from environment
 */
function loadConfig(): ServerConfig {
  const config: ServerConfig = {
    port: parseInt(process.env.PORT || String(API_CONFIG.DEFAULT_PORT), 10),
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
    anthropicApiUrl: API_CONFIG.ANTHROPIC_API_URL,
    anthropicVersion: API_CONFIG.ANTHROPIC_VERSION,
    anthropicModel: process.env.ANTHROPIC_MODEL || API_CONFIG.DEFAULT_MODEL,
    maxTokens: parseInt(process.env.MAX_TOKENS || String(API_CONFIG.DEFAULT_MAX_TOKENS), 10),
    nodeEnv: process.env.NODE_ENV || Environment.DEVELOPMENT,
  };

  // Validate configuration
  if (!config.anthropicApiKey) {
    logger.warn('ANTHROPIC_API_KEY is not set - AI responses will be mocked');
  }

  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    logger.error('Invalid PORT configuration, using default:', API_CONFIG.DEFAULT_PORT);
    config.port = API_CONFIG.DEFAULT_PORT;
  }

  if (isNaN(config.maxTokens) || config.maxTokens < 1) {
    logger.error('Invalid MAX_TOKENS configuration, using default:', API_CONFIG.DEFAULT_MAX_TOKENS);
    config.maxTokens = API_CONFIG.DEFAULT_MAX_TOKENS;
  }

  logger.info('Server configuration loaded', {
    port: config.port,
    model: config.anthropicModel,
    maxTokens: config.maxTokens,
    hasApiKey: !!config.anthropicApiKey,
  });

  return config;
}

export const config = loadConfig();
