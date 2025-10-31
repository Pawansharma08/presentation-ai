import "../scripts/set-database-url";
import { createOpenAI } from "@ai-sdk/openai";
import { type LanguageModelV1 } from "ai";
import { createOllama } from "ollama-ai-provider";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";

/**
 * Helper function to create Bedrock client with credentials
 */
function createBedrockClient(modelId?: string) {
  // On AWS/Amplify, region & credentials are auto-detected from the IAM role.
  // For local/dev, you can set BEDROCK_REGION or REGION for custom region.
  const region = process.env.BEDROCK_REGION || process.env.REGION;
  const bedrock = createAmazonBedrock(region ? { region } : undefined);
  const selectedModelId =
    modelId || process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0";
  return bedrock(selectedModelId) as unknown as LanguageModelV1;
}

/**
 * Centralized model picker function for all presentation generation routes
 * Supports OpenAI, Ollama, and LM Studio models
 */
export function modelPicker(
  modelProvider: string,
  modelId?: string,
): LanguageModelV1 {
  // OpenAI models
  if (modelProvider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    // Check for both undefined and empty string
    if (!apiKey || apiKey.trim() === "") {
      throw new Error(
        "OPENAI_API_KEY is required. Please set it in your .env file and restart the server."
      );
    }
    const openai = createOpenAI({ apiKey });
    const selectedModelId = modelId || "gpt-4o";
    return openai(selectedModelId) as unknown as LanguageModelV1;
  }

  // AWS Bedrock (Claude, etc.)
  if (modelProvider === "bedrock") {
    return createBedrockClient(modelId);
  }

  if (modelProvider === "ollama" && modelId) {
    // Use Ollama AI provider
    const ollama = createOllama();
    return ollama(modelId) as unknown as LanguageModelV1;
  }

  if (modelProvider === "lmstudio" && modelId) {
    // Use LM Studio with OpenAI compatible provider
    const lmstudio = createOpenAI({
      name: "lmstudio",
      baseURL: "http://localhost:1234/v1",
      apiKey: "lmstudio",
    });
    return lmstudio(modelId) as unknown as LanguageModelV1;
  }

  // Default to Bedrock if not specified
  return createBedrockClient(modelId);
}
