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

    // TODO: Call your AI API here
    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Hey! I'm doing great, thanks for asking. How about you?\n\nI'm here to help you with cloud pricing calculations. You can ask me questions like:\n\n- Compare AWS and Azure pricing for compute instances\n- What's the cost of running a Kubernetes cluster?\n- Help me optimize my cloud costs\n\nWhat would you like to know?`,
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
    // TODO: Load messages for this thread
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
