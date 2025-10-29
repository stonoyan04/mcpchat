/**
 * Frontend configuration
 */

import { API_CONFIG } from '../../shared/constants/index.js';
import { ClientConfig } from '../types/config.types.js';

/**
 * Load client configuration
 */
function loadClientConfig(): ClientConfig {
  // Check if we're in development or production
  const isDevelopment = import.meta.env.DEV;
  const apiPort = parseInt(import.meta.env.VITE_API_PORT || String(API_CONFIG.DEFAULT_PORT), 10);

  return {
    apiUrl: isDevelopment
      ? `http://localhost:${apiPort}`
      : import.meta.env.VITE_API_URL || `http://localhost:${apiPort}`,
    apiPort,
  };
}

export const clientConfig = loadClientConfig();
