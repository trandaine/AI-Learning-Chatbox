import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import { ChatView, verifyEnv } from './utils.js';

// Verify that environment variables are set
verifyEnv();
// Initialize OpenRouter client with API key
const openRouter = createOpenRouter({ apiKey: process.env.OPENROUTER_KEY });
// Get current model and convert it to AI SDK compatible model
const openRouterModel = openRouter(process.env.MODEL_ID);

// Get UI Elements
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messagesContainer = document.getElementById("messages-container");
const chatContainer = document.getElementById("chat-container");
const personaSelector = document.getElementById("persona-selector");


// Create chat view
const chatView = new ChatView(chatContainer, messagesContainer);

// Conversation is initially empty
const messages = [];

// Define personas for the selector
const personas = [
  { value: 'assistant', label: 'Assistant' },
  { value: 'eli5', label: 'ELI5' },
  { value: 'coach', label: 'Coach' },
];

function start() {

  // Add options to Persona selector
  personas.forEach(persona => {
    const option = document.createElement("option");
    option.value = persona.value;
    option.textContent = persona.label;
    personaSelector.appendChild(option);
  });

  // Handle user's message to the AI
  chatForm.addEventListener("submit", handleUserMessage);
}

async function handleUserMessage(event) {

  // Prevents default form submission
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


  const systemPrompts = {
    assistant: `You are a helpful, polite, and versatile AI assistant. Answer queries clearly and accurately.`,
    eli5: `You explain complex concepts in extremely simple terms as if speaking to a 5-year-old. Use clear metaphors, simple words, and zero technical jargon.`,
    coach: `You are an energetic, supportive, and empathetic life coach. Provide actionable advice, positive reinforcement, and motivate the user to reach their goals.`
  };

  const selectedPersona = personaSelector ? personaSelector.value : "assistant";
  const selectedSystemPrompt = systemPrompts[selectedPersona] || systemPrompts.assistant;


  try {
    const response = await streamText({
      model: openRouterModel,
      system: `${selectedSystemPrompt} No intros or conclusions. Instead of assuming, ask for clarification.`,
      messages
    });

    // Update the assistant message as chunks arrive
    for await (const textChunk of response.textStream) {
      assistantMessage.content += textChunk;
      chatView.updateLatestMessage(assistantMessage.content);
    }

  } catch (err) {
    assistantMessage.content = `**Error:** ${err.message}`;
    chatView.updateLatestMessage(assistantMessage.content);
  } finally {

    disableInputWhileLoading(false);
  }
}

function disableInputWhileLoading(shouldDisable) {
  messageInput.disabled = shouldDisable;
  sendButton.disabled = shouldDisable;
}

start();