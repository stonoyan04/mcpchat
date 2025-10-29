/**
 * Main Chat Application class
 * Manages chat state and coordinates between UI and API
 */

import type { Message } from '../../shared/types/index.js';
import { Mode, MessageRole } from '../../shared/enums/index.js';
import { apiService } from '../services/api.service.js';
import { APIError } from '../errors/api.error.js';
import { logger } from '../../shared/utils/logger.js';
import { MessageRenderer } from './message-renderer.js';
import { LoadingIndicator } from './loading-indicator.js';

export class ChatApp {
  private messages: Message[] = [];
  private currentMode: Mode = Mode.CONTRARIAN;
  private messagesContainer: HTMLElement;
  private messageInput: HTMLInputElement;
  private chatForm: HTMLFormElement;
  private messageRenderer: MessageRenderer;
  private loadingIndicator: LoadingIndicator;

  constructor() {
    // Initialize DOM elements
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const chatForm = document.getElementById('chatForm');

    if (!messagesContainer || !messageInput || !chatForm) {
      throw new Error('Required DOM elements not found');
    }

    this.messagesContainer = messagesContainer;
    this.messageInput = messageInput as HTMLInputElement;
    this.chatForm = chatForm as HTMLFormElement;
    this.messageRenderer = new MessageRenderer(this.messagesContainer);
    this.loadingIndicator = new LoadingIndicator(this.messagesContainer);

    this.initializeEventListeners();
    logger.info('Chat application initialized');
  }

  /**
   * Set up event listeners for UI interactions
   */
  private initializeEventListeners(): void {
    // Handle form submission
    this.chatForm.addEventListener('submit', (e) => {
      void this.handleSubmit(e);
    });

    // Handle mode toggle buttons
    document.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.handleModeChange(btn as HTMLButtonElement));
    });

    // Enable send on Enter, new line on Shift+Enter
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.chatForm.requestSubmit();
      }
    });
  }

  /**
   * Handle mode change (Contrarian <-> Agreeable)
   */
  private handleModeChange(btn: HTMLButtonElement): void {
    const mode = btn.dataset.mode as Mode | undefined;

    if (!mode) {
      logger.warn('Invalid mode in button data attribute');
      return;
    }

    this.currentMode = mode;
    logger.debug('Mode changed', { mode });

    // Update UI to reflect active mode
    document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  }

  /**
   * Handle form submission (send message)
   */
  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const content = this.messageInput.value.trim();
    if (!content) {
      return;
    }

    // Add user message to chat
    this.addMessage({
      role: MessageRole.USER,
      content,
      timestamp: new Date(),
    });

    // Clear input
    this.messageInput.value = '';

    // Show loading indicator
    this.loadingIndicator.show(this.currentMode);

    try {
      // Send message to API
      const response = await apiService.sendMessage(content, this.currentMode);

      this.loadingIndicator.hide();

      // Add assistant response to chat
      this.addMessage({
        role: MessageRole.ASSISTANT,
        content: response,
        mode: this.currentMode,
        timestamp: new Date(),
      });

      logger.info('Message exchange completed successfully');
    } catch (error) {
      this.loadingIndicator.hide();
      this.handleError(error);
    }
  }

  /**
   * Handle errors gracefully
   */
  private handleError(error: unknown): void {
    let errorMessage = 'Sorry, I encountered an error processing your message.';

    if (error instanceof APIError) {
      if (error.statusCode === 0) {
        errorMessage =
          'Unable to connect to the server. Please check if the API server is running.';
      } else if (error.statusCode === 400) {
        errorMessage = 'Invalid request. Please try again.';
      }
      logger.error('API error occurred', error);
    } else {
      logger.error('Unexpected error occurred', error);
    }

    this.addMessage({
      role: MessageRole.ASSISTANT,
      content: errorMessage,
      mode: this.currentMode,
      timestamp: new Date(),
    });
  }

  /**
   * Add a message to the chat history and render it
   */
  private addMessage(message: Message): void {
    this.messages.push(message);
    this.messageRenderer.render(message);
    this.scrollToBottom();
  }

  /**
   * Scroll chat container to bottom
   */
  private scrollToBottom(): void {
    const container = this.messagesContainer.parentElement;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }
}
