import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

const PROVIDER_MODELS = {
  openai: "openai/gpt-oss-20b:free",
  anthropic: "anthropic/claude-haiku-4.5",
  google: "google/gemma-3-27b-it:free",
  meta: "meta-llama/llama-4-maverick:free",
  mistral: "mistralai/mistral-small-3.1-24b-instruct:free",
} as const;

const SYSTEM_PROMPT = `You are a helpful cloud pricing assistant for Priceyy, an intelligent cloud cost comparison platform.

Your responsibilities:
- Help users understand and compare cloud costs across AWS, Azure, and GCP
- Provide accurate pricing estimates and cost optimization recommendations
- Explain resource configurations and their cost implications
- Use tables to compare pricing when relevant
- Format all code examples with proper markdown syntax highlighting

Always be concise, accurate, and helpful. When discussing pricing, mention that costs may vary by region and usage patterns.`;

export const chatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          }),
        ),
        provider: z.enum(["openai", "anthropic", "google", "mistral", "meta"]),
      }),
    )
    .mutation(async ({ input }) => {
      const { messages, provider } = input;
      const model = PROVIDER_MODELS[provider];

      try {
        const result = await openRouter.chat.send({
          model,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            ...messages,
          ],
          maxTokens: 4096,
          temperature: 0.7,
          stream: true,
        });

        let fullContent = "";

        for await (const chunk of result as any) {
          if (chunk.choices?.[0]?.delta?.content) {
            fullContent += chunk.choices[0].delta.content;
          }
        }

        return {
          content: fullContent,
          model: model,
          provider: provider,
        };
      } catch (error: any) {
        console.error("OpenRouter API error:", error);
        throw new Error(
          error?.message || "Failed to get response from AI model",
        );
      }
    }),

  getAvailableModels: publicProcedure.query(async () => {
    try {
      const models = await openRouter.models.list();
      return models;
    } catch (error) {
      console.error("Failed to fetch models:", error);
      return { data: [] };
    }
  }),
});
