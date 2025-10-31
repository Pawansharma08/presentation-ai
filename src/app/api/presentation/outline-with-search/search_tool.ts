import { env } from "@/env";
import { tavily } from "@tavily/core";
import { type Tool } from "ai";
import z from "zod";

// Lazy initialize tavily service only when API key is available
let tavilyService: ReturnType<typeof tavily> | null = null;

function getTavilyService() {
  if (!tavilyService && env.TAVILY_API_KEY && env.TAVILY_API_KEY.trim() !== "") {
    tavilyService = tavily({ apiKey: env.TAVILY_API_KEY });
  }
  return tavilyService;
}

export const search_tool: Tool = {
  description:
    "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events like news, weather, stock price etc. Input should be a search query.",
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      const service = getTavilyService();
      if (!service) {
        console.warn("Tavily API key not configured. Web search is disabled.");
        return JSON.stringify({ 
          error: "Web search is not configured",
          message: "TAVILY_API_KEY is not set in environment variables"
        });
      }
      const response = await service.search(query, { max_results: 5 });
      return JSON.stringify(response);
    } catch (error) {
      console.error("Search error:", error);
      return JSON.stringify({ 
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
};
