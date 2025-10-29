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
  show(mode: Mode): void {
    // Remove existing loading indicator if any
    this.hide();

    const loadingEl = this.createLoadingElement(mode);
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
  private createLoadingElement(mode: Mode): HTMLDivElement {
    const loadingEl = document.createElement('div');
    loadingEl.id = this.loadingElementId;
    loadingEl.className = `message ${MessageRole.ASSISTANT} ${mode}`;

    const modeConfig = MODE_CONFIG[mode];

    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = modeConfig.label;

    const content = document.createElement('div');
    content.className = 'message-content loading';
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
