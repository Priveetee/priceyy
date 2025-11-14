import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { OpenRouter } from "@openrouter/sdk";
import { FREE_MODELS, MODEL_DISPLAY_NAMES } from "@/lib/ai-models-config";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

const SYSTEM_PROMPT = `You are a helpful cloud pricing assistant for Priceyy, an intelligent cloud cost comparison platform.

Your responsibilities:
- Help users understand and compare cloud costs across AWS, Azure, and GCP
- Provide accurate pricing estimates and cost optimization recommendations
- Format code examples with proper markdown syntax highlighting
- Mention that costs may vary by region and usage patterns`;

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
      const modelsToTry = [...FREE_MODELS[provider], ...FREE_MODELS.fallback];

      let lastError: any = null;
      let isFallback = false;
      let attemptCount = 0;

      const formattedMessages = messages.map((msg) => {
        if (msg.role === "assistant") {
          return {
            role: "assistant" as const,
            content: msg.content,
          };
        } else if (msg.role === "user") {
          return {
            role: "user" as const,
            content: msg.content,
          };
        } else {
          return {
            role: "system" as const,
            content: msg.content,
          };
        }
      });

      const primaryModelsCount = FREE_MODELS[provider].length;

      for (let i = 0; i < modelsToTry.length; i++) {
        const model = modelsToTry[i];
        attemptCount++;

        if (i >= primaryModelsCount) {
          isFallback = true;
        }

        try {
          const result = await openRouter.chat.send({
            model,
            messages: [
              {
                role: "system",
                content: SYSTEM_PROMPT,
              },
              ...formattedMessages,
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
            modelDisplayName: MODEL_DISPLAY_NAMES[model] || model,
            provider: provider,
            isFallback,
            originalProvider: provider,
          };
        } catch (error: any) {
          lastError = error;
          continue;
        }
      }

      throw new Error(
        lastError?.message ||
          "All models are currently unavailable. Please try again later.",
      );
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
