import { marked } from "marked";
import { encode } from 'gpt-tokenizer';
import DOMPurify from "dompurify";

export function verifyEnv() {
  if (!process.env.OPENROUTER_KEY) {
    console.error('❌ OPENROUTER_KEY env variable is not set');
  }
  if (!process.env.MODEL_ID) {
    console.error('❌ MODEL_ID env variable is not set');
  }
  if (process.env.OPENROUTER_KEY && process.env.MODEL_ID) {
    console.log('✅ OPENROUTER_KEY and MODEL_ID env variables are set');
  }
}

export function formatErrorMessage(error) {
  if (error.message.includes('maximum context length')) {
    return 'Error: Your request does not fit within the model\'s context window.';
  } else {
    return `Error: ${error.message}`;
  }
}


export function calculateTokens(messages) {
  // Combine all message content
  const allContent = messages.map(m => m.content).join();

  // Use gpt-tokenizer to get token count
  const tokens = encode(allContent);
  return tokens.length;
}


export function printUsageData(usage, totalUsage) {
  console.log('\n📈 Token Usage Report:');
  console.log('   Last Step:', usage);
  console.log('   Overall:', totalUsage);
}


export class ChatView {
  constructor(chatContainer, messagesContainer) {
    this.chatContainer = chatContainer;
    this.messagesContainer = messagesContainer;
    this.messageCount = 0;
    this.maxMessages = 20;

    // Get counter elements from the chat container
    // this.totalMessagesCounter = chatContainer.querySelector('#total-messages-counter');
    // this.contextMessagesCounter = chatContainer.querySelector('#context-messages-counter');

    this.totalTokensCounter = chatContainer.querySelector('#total-tokens-counter');
    this.contextMessagesCounter = chatContainer.querySelector('#context-messages-counter');
  }

  addMessage(message) {
    const messageElement = this.createMessageElement(message);
    this.messagesContainer.appendChild(messageElement);
    this.messageCount++;

    this.trimOldMessages();
    this.scrollToBottom();

    return messageElement;
  }

  updateLatestMessage(content) {
    const lastMessage = this.messagesContainer.lastElementChild;
    if (lastMessage) {
      const contentDiv = lastMessage.querySelector('.message-content');
      if (contentDiv) {
        contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(content));
      } else {
        // Fallback if no content div exists
        lastMessage.innerHTML = DOMPurify.sanitize(marked.parse(content));
      }
    }
  }

  createMessageElement(message) {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${message.role}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    if (message.role === "assistant" && !message.content) {
      // Loading state
      contentDiv.innerHTML = `
        <div class="loading-indicator">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      `;
    } else {
      contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(message.content || ''));
    }

    messageElement.appendChild(contentDiv);
    return messageElement;
  }

  trimOldMessages() {
    while (this.messagesContainer.children.length > this.maxMessages) {
      this.messagesContainer.removeChild(this.messagesContainer.firstChild);
      this.messageCount--;
    }
  }

  scrollToBottom() {
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  updateCounters(allMessages, contextMessages = null) {
    // const totalCount = allMessages.length;
    // const contextCount = contextMessages ? contextMessages.length : totalCount;

    // this.totalMessagesCounter.textContent = `${totalCount} total message${totalCount === 1 ? '' : 's'}`;
    // this.contextMessagesCounter.textContent = `${contextCount} context message${contextCount === 1 ? '' : 's'}`;

    const totalTokens = calculateTokens(allMessages);
    const contextTokens = contextMessages ? calculateTokens(contextMessages) : totalTokens;

    // this.totalTokensCounter.textContent = `${totalTokens} total tokens`;
    // this.contextTokensCounter.textContent = `${contextTokens} context tokens`;
    if (this.totalTokensCounter) {
      this.totalTokensCounter.textContent = `${totalTokens} total token${totalTokens === 1 ? '' : 's'}`;
    }
    if (this.contextTokensCounter) {
      this.contextTokensCounter.textContent = `${contextTokens} context token${contextTokens === 1 ? '' : 's'}`;
    }
  }
}