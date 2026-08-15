import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import initialMessages from './conversation.js';
import { calculateTokens, ChatView, verifyEnv, formatErrorMessage } from './utils.js';

// Verify environment variables
verifyEnv();

// Initialize OpenRouter client with API key and model
const openRouter = createOpenRouter({ apiKey: process.env.OPENROUTER_KEY });
const openRouterModel = openRouter(process.env.MODEL_ID);

// Get UI Elements
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messagesContainer = document.getElementById("messages-container");
const chatContainer = document.getElementById("chat-container");
const personaSelector = document.getElementById("persona-selector");

// Initialize chat view and message history
const messages = [...initialMessages];
const chatView = new ChatView(chatContainer, messagesContainer);

// Define personas for selector
const personas = [
  { value: 'assistant', label: 'Assistant' },
  { value: 'eli5', label: 'ELI5' },
  { value: 'coach', label: 'Coach' },
];

function start() {
  // Render initial conversation history
  messages.forEach(message => {
    chatView.addMessage(message);
  });
  
  // Update initial message counters
  chatView.updateCounters(messages);

  // Populate persona selector if available in the DOM
  if (personaSelector) {
    personas.forEach(persona => {
      const option = document.createElement("option");
      option.value = persona.value;
      option.textContent = persona.label;
      personaSelector.appendChild(option);
    });
  }

  // Handle user form submission
  chatForm.addEventListener("submit", handleUserMessage);
}



/**
 * Keep removing the oldest messages from the conversation
 * until the total token count is under maxTokens.
 *
 * @param {Array} messages - The array of conversation messages
 * @param {number} tokenLimit - The maximum allowed token count
 * @returns {Array} The trimmed messages array
 */
function getTrimmedContext(messages, tokenLimit) {
  // Create a shallow copy so we don't mutate the original array
  const trimmedMessages = [...messages];

  // Remove the oldest message (index 0) while over the limit and keeping at least 1 message
  while (trimmedMessages.length > 1 && calculateTokens(trimmedMessages) > tokenLimit) {
    trimmedMessages.shift();
  }

  return trimmedMessages;
}




async function handleUserMessage(event) {
  event.preventDefault();

  // Exit if message is empty, otherwise disable input while loading
  const userInput = messageInput.value.trim();
  if (!userInput) return;

  messageInput.value = "";
  disableInputWhileLoading(true);

  // Add user message
  const userMessage = { role: "user", content: userInput };
  messages.push(userMessage);
  chatView.addMessage(userMessage);

  // Add assistant message placeholder
  const assistantMessage = { role: "assistant", content: "" };
  messages.push(assistantMessage);
  chatView.addMessage(assistantMessage);

  // Configure persona system prompts
  const systemPrompts = {
    assistant: `You are a helpful, polite, and versatile AI assistant. Answer queries clearly and accurately.`,
    eli5: `You explain complex concepts in extremely simple terms as if speaking to a 5-year-old. Use clear metaphors, simple words, and zero technical jargon.`,
    coach: `You are an energetic, supportive, and empathetic life coach. Provide actionable advice, positive reinforcement, and motivate the user to reach their goals.`
  };

  const selectedPersona = personaSelector ? personaSelector.value : "assistant";
  const selectedSystemPrompt = systemPrompts[selectedPersona] || systemPrompts.assistant;

  // Trim context to the last 10 messages
  // const contextMessages = messages.slice(-10);

  // Set max tokens for context trimming
  const MAX_TOKENS = 20000;
  const contextMessages = getTrimmedContext(messages, MAX_TOKENS);


  chatView.updateCounters(messages, contextMessages);

  try {
    const response = await streamText({
      model: openRouterModel,
      system: `${selectedSystemPrompt} No intros or conclusions. Instead of assuming, ask for clarification.`,
      messages: contextMessages
    });

    // Process stream events and text chunks
    for await (const event of response.fullStream) {
      if (event.type === 'error') {
        throw event.error;
      } else if (event.type === 'text-delta') {
        assistantMessage.content += event.text;
        chatView.updateLatestMessage(assistantMessage.content);
      }
    }
  } catch (err) {
    assistantMessage.content = formatErrorMessage(err);
    chatView.updateLatestMessage(assistantMessage.content);
  } finally {
    disableInputWhileLoading(false);
    chatView.updateCounters(messages, contextMessages);
  }
}

function disableInputWhileLoading(shouldDisable) {
  messageInput.disabled = shouldDisable;
  sendButton.disabled = shouldDisable;
}

start();