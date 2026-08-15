import { getTotalTokenCount, getMessageTokenCount } from "./utils.js";
import { generateText } from 'ai';

/**
 * Context Summarization Challenge
 * 
 * Your task is to implement the two functions splitForSummary
 * and generateSummary below.
 * 
 * Available utilities:
 * - getTotalTokenCount(messages) -> total token count for a messages array
 * - getMessageTokenCount(message) -> token count for a single message
 *
 * 💡 Check the hints folder if you're stuck.
 */

/**
 * Challenge 1: Implement splitForSummary
 * 
 * This function's goal is to split the `messages` array into two parts:
 * 
 * - messagesToSummarize: older messages that need to be summarized
 * - remainingMessages: recent messages to keep as-is
 * 
 * You need to find the "split point" (an index) where the number of
 * tokens in remainingMessages is within the tokenTarget.
 */
export function splitForSummary(messages, tokenTarget) {
  let accumulatedTokens = 0;
  let splitIndex = messages.length;

  // Work backwards from the most recent message
  for (let i = messages.length - 1; i >= 0; i--) {
    const tokenCount = getMessageTokenCount(messages[i]);

    // Keep adding recent messages while staying within tokenTarget
    if (accumulatedTokens + tokenCount <= tokenTarget) {
      accumulatedTokens += tokenCount;
      splitIndex = i;
    } else {
      break;
    }
  }

  // Ensure we keep at least the most recent message if tokenTarget is very small
  if (splitIndex === messages.length && messages.length > 0) {
    splitIndex = messages.length - 1;
  }

  return {
    messagesToSummarize: messages.slice(0, splitIndex),
    remainingMessages: messages.slice(splitIndex)
  };
}

/**
 * Challenge 2: Implement generateSummary
 * 
 * This function takes an array of messages and uses the AI model
 * to create a condensed summary.
 * 
 * Remember, you must add a new message to the array to explicitly
 * ask the AI to create a summary.
 * 
 * Return a final message object containing the summary.
 */
export async function generateSummary(messages, model) {
  // Instruction requesting a concise summary of the conversation history
  const summarizationPrompt = {
    role: "user",
    content: "Summarize the key information, context, user preferences, and decisions from the conversation above. Keep it concise, structured, and factual without intro or outro."
  };

  // Call the model using generateText
  const { text } = await generateText({
    model,
    messages: [...messages, summarizationPrompt],
    system: "You are an expert context summarizer. Provide a concise summary of previous conversations to preserve long-term context."
  });

  return {
    role: "system",
    content: `Summary of previous conversation:\n${text.trim()}`
  };
}