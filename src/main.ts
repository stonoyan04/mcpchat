/**
 * Application Entry Point
 * Initializes the chat application
 */

import { ChatApp } from './components/chat-app.js';
import { logger } from '../shared/utils/logger.js';

// Initialize the application when DOM is ready
try {
  new ChatApp();
} catch (error) {
  logger.error('Failed to initialize chat application', error);
  alert('Failed to initialize chat application. Please refresh the page.');
}
