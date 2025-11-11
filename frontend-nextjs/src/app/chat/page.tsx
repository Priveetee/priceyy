"use client";

import { ChatInput } from "./components/chat-input";
import { ChatHeader } from "./components/chat-header";
import { ChatSidebar } from "./components/chat-sidebar";
import { ChatMessages } from "./components/chat-messages";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = async (message: string, provider: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
      provider,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response with rich markdown content
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `# Cloud Pricing Comparison

Hey! I'm here to help you with cloud pricing. Here's a quick comparison:

## AWS vs Azure vs GCP

| Provider | Compute Instance | Monthly Cost | Storage (1TB) |
|----------|-----------------|--------------|---------------|
| AWS      | t3.medium       | $30.37       | $23.00        |
| Azure    | B2s             | $30.66       | $20.00        |
| GCP      | e2-medium       | $24.27       | $20.00        |

### Sample Code: Calculate Monthly Costs

Here's a Python script to calculate your cloud costs:

\`\`\`python
def calculate_monthly_cost(instances, hours_per_month=730):
    """
    Calculate total monthly cost for cloud instances

    Args:
        instances: List of instance types with hourly rates
        hours_per_month: Number of hours in a month (default: 730)

    Returns:
        Total monthly cost
    """
    total_cost = 0
    for instance in instances:
        hourly_rate = instance['rate']
        quantity = instance['quantity']
        total_cost += hourly_rate * quantity * hours_per_month

    return round(total_cost, 2)

# Example usage
instances = [
    {'name': 't3.medium', 'rate': 0.0416, 'quantity': 2},
    {'name': 't3.large', 'rate': 0.0832, 'quantity': 1}
]

total = calculate_monthly_cost(instances)
print(f"Total monthly cost: \${total}")
\`\`\`

### Key Features:

- **Auto-scaling**: Automatically adjust resources based on demand
- **Reserved Instances**: Save up to 72% with 1-3 year commitments
- **Spot Instances**: Save up to 90% on unused capacity

You can also use inline code like \`aws ec2 describe-instances\` for quick commands.

**Need more details?** Just ask! 🚀`,
        timestamp: new Date(),
        provider,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setCurrentThreadId(undefined);
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    console.log("Selected thread:", threadId);
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950">
      <ChatSidebar
        onNewChat={handleNewChat}
        onSelectThread={handleSelectThread}
        currentThreadId={currentThreadId}
      />

      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <ChatHeader onPromptClick={handlePromptClick} />
          </div>
        ) : (
          <ChatMessages messages={messages} />
        )}

        <div className="p-6">
          <ChatInput
            value={input}
            onValueChange={setInput}
            onSubmit={handleSubmit}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
