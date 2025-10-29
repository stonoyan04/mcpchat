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
    messageEl.className = `message ${message.role}`;

    // Add mode-specific styling for assistant messages
    if (message.role === MessageRole.ASSISTANT && message.mode) {
      messageEl.classList.add(message.mode);
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

    if (message.role === MessageRole.USER) {
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
