/**
 * Loading Indicator
 * Manages the loading animation UI
 */

import { Mode, MessageRole } from '../../shared/enums/index.js';
import { MODE_CONFIG } from '../../shared/constants/index.js';

export class LoadingIndicator {
  private loadingElementId = 'loading';

  constructor(private messagesContainer: HTMLElement) {}

  /**
   * Show loading indicator
   */
  show(mode: Mode, speaker?: 'AI-1' | 'AI-2'): void {
    // Remove existing loading indicator if any
    this.hide();

    const loadingEl = this.createLoadingElement(mode, speaker);
    this.messagesContainer.appendChild(loadingEl);
    this.scrollToBottom();
  }

  /**
   * Hide loading indicator
   */
  hide(): void {
    const loadingEl = document.getElementById(this.loadingElementId);
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  /**
   * Create loading element
   */
  private createLoadingElement(mode: Mode, speaker?: 'AI-1' | 'AI-2'): HTMLDivElement {
    const loadingEl = document.createElement('div');
    loadingEl.id = this.loadingElementId;

    // Handle debate mode with speakers
    if (speaker === 'AI-1') {
      loadingEl.className = 'message assistant debate ai-1';
    } else if (speaker === 'AI-2') {
      loadingEl.className = 'message user debate ai-2';
    } else {
      loadingEl.className = `message ${MessageRole.ASSISTANT} ${mode}`;
    }

    const label = document.createElement('div');
    label.className = 'message-label';

    if (speaker === 'AI-1') {
      label.textContent = 'AI-1 (For)';
    } else if (speaker === 'AI-2') {
      label.textContent = 'AI-2 (Against)';
    } else {
      const modeConfig = MODE_CONFIG[mode];
      label.textContent = modeConfig.label;
    }

    const content = document.createElement('div');
    content.className = 'message-content loading';

    // Add speaker-specific class for loading dots color
    if (speaker === 'AI-2') {
      content.classList.add('loading-ai-2');
    } else if (speaker === 'AI-1') {
      content.classList.add('loading-ai-1');
    }

    content.innerHTML =
      '<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>';

    loadingEl.appendChild(label);
    loadingEl.appendChild(content);

    return loadingEl;
  }

  /**
   * Scroll to bottom of messages
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
