"use client";

import { ChatInput } from "./components/chat-input";
import { ChatHeader } from "./components/chat-header";
import { ChatSidebar } from "./components/chat-sidebar";
import { ChatMessages } from "./components/chat-messages";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

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

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: (data, variables) => {
      let content = "";

      if (typeof data.content === "string") {
        content = data.content;
      } else if (Array.isArray(data.content)) {
        content = data.content
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }
            if ("type" in item && item.type === "text" && "text" in item) {
              return item.text;
            }
            return "";
          })
          .filter(Boolean)
          .join("\n");
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content,
        timestamp: new Date(),
        provider: variables.provider,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
      setIsLoading(false);
    },
  });

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = async (message: string, provider: string) => {
    if (!message.trim() || isLoading) return;

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

    const chatMessages = [...messages, userMessage].map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    sendMessage.mutate({
      messages: chatMessages,
      provider: provider as any,
    });
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
