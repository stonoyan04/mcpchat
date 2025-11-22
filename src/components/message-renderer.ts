/**
 * Message Renderer
 * Handles rendering of chat messages in the UI
 */

import type { Message } from '../../shared/types/index.js';
import { MessageRole } from '../../shared/enums/index.js';
import { MODE_CONFIG } from '../../shared/constants/index.js';

export class MessageRenderer {
  constructor(private messagesContainer: HTMLElement) {}

  /**
   * Render a message in the UI
   */
  render(message: Message): void {
    const messageEl = this.createMessageElement(message);
    this.messagesContainer.appendChild(messageEl);
  }

  /**
   * Create a message DOM element
   */
  private createMessageElement(message: Message): HTMLDivElement {
    const messageEl = document.createElement('div');

    // Check if this is a debate message with AI-1 or AI-2
    const isAI2 = message.content.trim().startsWith('AI-2:');
    const isAI1 = message.content.trim().startsWith('AI-1:');

    if (isAI1) {
      // AI-1 appears on the left like assistant
      messageEl.className = 'message assistant debate ai-1';
    } else if (isAI2) {
      // AI-2 appears on the right like user
      messageEl.className = 'message user debate ai-2';
    } else {
      // Regular message
      messageEl.className = `message ${message.role}`;

      // Add mode-specific styling for assistant messages
      if (message.role === MessageRole.ASSISTANT && message.mode) {
        messageEl.classList.add(message.mode);
      }
    }

    const label = this.createLabelElement(message);
    const content = this.createContentElement(message);

    messageEl.appendChild(label);
    messageEl.appendChild(content);

    return messageEl;
  }

  /**
   * Create message label element
   */
  private createLabelElement(message: Message): HTMLDivElement {
    const label = document.createElement('div');
    label.className = 'message-label';

    // Check for AI-1 or AI-2 in debate mode
    if (message.content.trim().startsWith('AI-1:')) {
      label.textContent = 'AI-1 (For)';
    } else if (message.content.trim().startsWith('AI-2:')) {
      label.textContent = 'AI-2 (Against)';
    } else if (message.role === MessageRole.USER) {
      label.textContent = 'You';
    } else if (message.mode) {
      const modeConfig = MODE_CONFIG[message.mode];
      label.textContent = modeConfig.label;
    }

    return label;
  }

  /**
   * Create message content element
   */
  private createContentElement(message: Message): HTMLDivElement {
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = message.content;
    return content;
  }
}
