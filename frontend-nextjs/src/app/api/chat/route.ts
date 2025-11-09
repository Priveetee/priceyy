import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, UIMessage } from "ai";

export const maxDuration = 30;

function convertUIMessagesToModelMessages(
  messages: UIMessage[],
): { role: "user" | "assistant"; content: string }[] {
  return messages
    .filter(
      (msg): msg is UIMessage & { role: "user" | "assistant" } =>
        msg.role === "user" || msg.role === "assistant",
    )
    .map((msg) => {
      const content =
        msg.parts
          ?.filter((part) => part.type === "text")
          .map((part) => (part as { type: "text"; text: string }).text)
          .join("\n") || "";

      return { role: msg.role, content };
    })
    .filter((msg) => msg.content.trim() !== "");
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response("OPENROUTER_API_KEY is not set.", {
      status: 500,
    });
  }

  const openrouter = createOpenRouter({ apiKey });

  const { messages }: { messages: UIMessage[] } = await req.json();

  const systemMessage = `You are a helpful and concise cloud cost advisor for the 'Priceyy' application. Your only role is to provide information and guidance to the user.

  **CRITICAL RULES:**
  - You have NO ability to perform actions. You cannot add resources, search the database, or navigate the application. You are a chatbot.
  - When a user asks you to "add" or "search for" something, you must explain that you cannot perform actions. Instead, provide them with the information they need to do it themselves using the application's UI.
  - Your knowledge is based on general information about cloud services (AWS, Azure, GCP). You do not have real-time data.
  - Keep your answers direct and focused on providing advice.

  **Example Interaction:**
  User: "add an aws t2.micro instance"
  Your Response: "A t2.micro is a good choice for small workloads. You can add it to your estimate by clicking the 'Add Resource' button and searching for 't2.micro' under the AWS provider."`;

  const processedMessages = convertUIMessagesToModelMessages(messages);

  if (processedMessages.length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid content in messages" }),
      { status: 400 },
    );
  }

  const result = await streamText({
    model: openrouter("openrouter/polaris-alpha"),
    system: systemMessage,
    messages: processedMessages,
  });

  return result.toUIMessageStreamResponse();
}
