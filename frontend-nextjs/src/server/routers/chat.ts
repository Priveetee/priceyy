import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { OpenRouter } from "@openrouter/sdk";
import { AI_TOOLS_SCHEMA } from "@/lib/ai-tools-schema";
import { FREE_MODELS, MODEL_DISPLAY_NAMES } from "@/lib/ai-models-config";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

const SYSTEM_PROMPT = `You are a helpful cloud pricing assistant for Priceyy, an intelligent cloud cost comparison platform.

Your responsibilities:
- Help users understand and compare cloud costs across AWS, Azure, and GCP
- Guide users through resource selection using available tools
- Provide accurate pricing estimates and cost optimization recommendations
- Use tools to search for resources, get pricing options, and add items to cart
- ALWAYS confirm with the user before adding items to their cart
- When user asks about resources, use search_resources tool to find available options
- Present pricing information clearly with tables when comparing options

Important guidelines:
- Ask clarifying questions if provider, region, or resource type is not specified
- Use tools in sequence: get_providers -> get_regions -> search_resources -> get_pricing_options -> add_to_cart
- Never add to cart without explicit user confirmation
- Format code examples with proper markdown syntax highlighting
- Mention that costs may vary by region and usage patterns`;

export const chatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system", "tool"]),
            content: z.string(),
            tool_call_id: z.string().optional(),
            tool_calls: z.array(z.any()).optional(),
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
        if (msg.role === "tool") {
          return {
            role: "tool" as const,
            content: msg.content,
            toolCallId: msg.tool_call_id!,
          };
        } else if (msg.role === "assistant" && msg.tool_calls) {
          return {
            role: "assistant" as const,
            content: msg.content || null,
            toolCalls: msg.tool_calls,
          };
        } else if (msg.role === "assistant") {
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
            tools: AI_TOOLS_SCHEMA as any,
            maxTokens: 4096,
            temperature: 0.7,
            stream: true,
          });

          let fullContent = "";
          const toolCalls: any[] = [];

          for await (const chunk of result as any) {
            if (chunk.choices?.[0]?.delta?.content) {
              fullContent += chunk.choices[0].delta.content;
            }

            if (chunk.choices?.[0]?.delta?.toolCalls) {
              const deltaToolCalls = chunk.choices[0].delta.toolCalls;

              for (const deltaCall of deltaToolCalls) {
                if (deltaCall.index !== undefined) {
                  const idx = deltaCall.index;

                  if (!toolCalls[idx]) {
                    toolCalls[idx] = {
                      id: deltaCall.id || `call_${Date.now()}_${idx}`,
                      type: "function",
                      function: {
                        name: "",
                        arguments: "",
                      },
                    };
                  }

                  if (deltaCall.id) {
                    toolCalls[idx].id = deltaCall.id;
                  }

                  if (deltaCall.type) {
                    toolCalls[idx].type = deltaCall.type;
                  }

                  if (deltaCall.function?.name) {
                    toolCalls[idx].function.name += deltaCall.function.name;
                  }

                  if (deltaCall.function?.arguments) {
                    toolCalls[idx].function.arguments +=
                      deltaCall.function.arguments;
                  }
                }
              }
            }
          }

          const validToolCalls = toolCalls.filter((tc) => {
            return (
              tc &&
              tc.function &&
              tc.function.name &&
              tc.function.name.length > 0
            );
          });

          return {
            content: fullContent,
            toolCalls: validToolCalls,
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
