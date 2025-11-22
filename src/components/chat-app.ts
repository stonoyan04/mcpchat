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
  private debateControls: HTMLElement | null;
  private debateTopicInput: HTMLInputElement | null;
  private startDebateBtn: HTMLButtonElement | null;
  private stopDebateBtn: HTMLButtonElement | null;
  private isDebating: boolean = false;
  private currentDebateTopic: string = '';
  private currentSpeaker: 'AI-1' | 'AI-2' = 'AI-1';
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
    this.debateControls = document.getElementById('debateControls');
    this.debateTopicInput = document.getElementById('debateTopic') as HTMLInputElement | null;
    this.startDebateBtn = document.getElementById('startDebateBtn') as HTMLButtonElement | null;
    this.stopDebateBtn = document.getElementById('stopDebateBtn') as HTMLButtonElement | null;
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

    // Handle start debate button
    if (this.startDebateBtn) {
      this.startDebateBtn.addEventListener('click', () => {
        void this.handleStartDebate();
      });
    }

    // Handle stop debate button
    if (this.stopDebateBtn) {
      this.stopDebateBtn.addEventListener('click', () => {
        this.handleStopDebate();
      });
    }

    // Enable send on Enter, new line on Shift+Enter
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.chatForm.requestSubmit();
      }
    });

    // Enable start debate on Enter in topic input
    if (this.debateTopicInput) {
      this.debateTopicInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          void this.handleStartDebate();
        }
      });
    }
  }

  /**
   * Handle mode change (Contrarian <-> Agreeable <-> Debate)
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

    // Show/hide debate controls based on mode
    if (this.debateControls && this.chatForm) {
      if (mode === Mode.DEBATE) {
        this.debateControls.style.display = 'flex';
        this.chatForm.style.display = 'none';
      } else {
        this.debateControls.style.display = 'none';
        this.chatForm.style.display = 'flex';
      }
    }
  }

  /**
   * Handle start debate button click
   */
  private async handleStartDebate(): Promise<void> {
    const topic = this.debateTopicInput?.value.trim();
    if (!topic) {
      alert('Please enter a debate topic');
      return;
    }

    this.currentDebateTopic = topic;
    this.isDebating = true;
    this.currentSpeaker = 'AI-1'; // Always start with AI-1

    // Update UI
    if (this.startDebateBtn && this.stopDebateBtn && this.debateTopicInput) {
      this.startDebateBtn.style.display = 'none';
      this.stopDebateBtn.style.display = 'flex';
      this.debateTopicInput.disabled = true;
    }

    // Start continuous debate
    await this.continueDebate();
  }

  /**
   * Handle stop debate button click
   */
  private handleStopDebate(): void {
    this.isDebating = false;
    this.currentSpeaker = 'AI-1'; // Reset for next debate

    // Update UI
    if (this.startDebateBtn && this.stopDebateBtn && this.debateTopicInput) {
      this.startDebateBtn.style.display = 'flex';
      this.stopDebateBtn.style.display = 'none';
      this.debateTopicInput.disabled = false;
      this.debateTopicInput.value = '';
    }

    this.loadingIndicator.hide();
    logger.info('Debate stopped');
  }

  /**
   * Continue the debate loop
   */
  private async continueDebate(): Promise<void> {
    while (this.isDebating) {
      const content = `${this.currentSpeaker} speaks on: ${this.currentDebateTopic}`;

      // Show loading indicator with current speaker
      this.loadingIndicator.show(this.currentMode, this.currentSpeaker);

      try {
        // Send message to API with speaker info
        const response = await apiService.sendMessage(
          content,
          this.currentMode,
          this.currentDebateTopic,
          this.currentSpeaker
        );

        this.loadingIndicator.hide();

        if (!this.isDebating) {
          break;
        }

        // Add assistant response to chat
        this.addMessage({
          role: MessageRole.ASSISTANT,
          content: response,
          mode: this.currentMode,
          timestamp: new Date(),
        });

        logger.info(`${this.currentSpeaker} spoke successfully`);

        // Alternate speaker for next turn
        this.currentSpeaker = this.currentSpeaker === 'AI-1' ? 'AI-2' : 'AI-1';

        // Small delay before next exchange
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        this.loadingIndicator.hide();
        this.handleError(error);
        this.handleStopDebate();
        break;
      }
    }
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
