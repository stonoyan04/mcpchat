type Mode = 'contrarian' | 'agreeable';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  mode?: Mode;
}

class ChatApp {
  private messages: Message[] = [];
  private currentMode: Mode = 'contrarian';
  private messagesContainer: HTMLElement;
  private messageInput: HTMLInputElement;
  private chatForm: HTMLFormElement;

  constructor() {
    this.messagesContainer = document.getElementById('messages')!;
    this.messageInput = document.getElementById('messageInput') as HTMLInputElement;
    this.chatForm = document.getElementById('chatForm') as HTMLFormElement;

    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));

    document.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.handleModeChange(btn as HTMLButtonElement));
    });
  }

  private handleModeChange(btn: HTMLButtonElement): void {
    const mode = btn.dataset.mode as Mode;
    this.currentMode = mode;

    document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const content = this.messageInput.value.trim();
    if (!content) return;

    this.addMessage({ role: 'user', content });
    this.messageInput.value = '';

    this.showLoading();

    try {
      const response = await this.sendToMCP(content, this.currentMode);
      this.hideLoading();
      this.addMessage({ role: 'assistant', content: response, mode: this.currentMode });
    } catch (error) {
      this.hideLoading();
      this.addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message.',
        mode: this.currentMode,
      });
      console.error('Error:', error);
    }
  }

  private async sendToMCP(message: string, mode: Mode): Promise<string> {
    const response = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, mode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  private addMessage(message: Message): void {
    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();
  }

  private renderMessage(message: Message): void {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.role}`;

    if (message.role === 'assistant' && message.mode) {
      messageEl.classList.add(message.mode);
    }

    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = message.role === 'user' ? 'You' : message.mode || 'Assistant';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = message.content;

    messageEl.appendChild(label);
    messageEl.appendChild(content);
    this.messagesContainer.appendChild(messageEl);
  }

  private showLoading(): void {
    const loadingEl = document.createElement('div');
    loadingEl.id = 'loading';
    loadingEl.className = `message assistant ${this.currentMode}`;

    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = this.currentMode;

    const content = document.createElement('div');
    content.className = 'message-content loading';
    content.innerHTML = '<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>';

    loadingEl.appendChild(label);
    loadingEl.appendChild(content);
    this.messagesContainer.appendChild(loadingEl);
    this.scrollToBottom();
  }

  private hideLoading(): void {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  private scrollToBottom(): void {
    this.messagesContainer.parentElement?.scrollTo({
      top: this.messagesContainer.parentElement.scrollHeight,
      behavior: 'smooth',
    });
  }
}

new ChatApp();
