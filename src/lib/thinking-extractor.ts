/**
 * Utility functions to extract thinking content from AI responses
 */

export interface ThinkingResult {
  thinking: string;
  content: string;
  hasThinking: boolean;
}

/**
 * Extracts thinking content from AI response
 * @param response - The AI response text
 * @returns Object containing thinking content, remaining content, and whether thinking was found
 */
export function extractThinking(response: string): ThinkingResult {
  // Check if response starts with <think>
  const thinkStartPattern = /^<think>/i;
  const thinkEndPattern = /<\/think>/i;

  if (!thinkStartPattern.test(response)) {
    return {
      thinking: "",
      content: response,
      hasThinking: false,
    };
  }

  // Find the end of thinking content
  const endMatch = response.match(thinkEndPattern);
  if (!endMatch) {
    // If no closing tag found, treat entire response as thinking
    return {
      thinking: response,
      content: "",
      hasThinking: true,
    };
  }

  // Extract thinking content (including the tags)
  const thinkingEndIndex = endMatch.index! + endMatch[0].length;
  const thinkingContent = response.substring(0, thinkingEndIndex);

  // Extract remaining content after thinking
  const remainingContent = response.substring(thinkingEndIndex).trim();

  return {
    thinking: thinkingContent,
    content: remainingContent,
    hasThinking: true,
  };
}

/**
 * Removes thinking tags from content
 * @param content - Content that may contain thinking tags
 * @returns Content with thinking tags removed
 */
export function removeThinkingTags(content: string): string {
  return content.replace(/^<think>[\s\S]*?<\/think>/i, "").trim();
}

/**
 * Checks if content starts with thinking
 * @param content - Content to check
 * @returns True if content starts with <think>
 */
export function startsWithThinking(content: string): boolean {
  return /^<think>/i.test(content);
}
