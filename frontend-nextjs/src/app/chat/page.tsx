"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { ChatMessages } from "./components/chat-messages";
import { ChatInput } from "./components/chat-input";
import { ChatSidebar } from "./components/chat-sidebar";
import { ChatHeader } from "./components/chat-header";
import { TypingIndicator } from "./components/typing-indicator";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  timestamp: Date;
  provider?: string;
  isFallback?: boolean;
  modelDisplayName?: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

type ChatThread = {
  id: string;
  title: string;
  timestamp: Date;
  messages: ChatMessage[];
};

const STORAGE_KEY = "priceyy-chat-threads";

export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<
    "openai" | "anthropic" | "google" | "mistral" | "meta"
  >("google");

  const sendMessage = trpc.chat.sendMessage.useMutation();

  const currentMessages = currentThreadId
    ? threads.find((t) => t.id === currentThreadId)?.messages || []
    : [];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const threadsWithDates = parsed.map((thread: any) => ({
          ...thread,
          timestamp: new Date(thread.timestamp),
          messages: thread.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setThreads(threadsWithDates);
      } catch (error) {
        console.error("Failed to parse stored threads:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    }
  }, [threads]);

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(
      provider as "openai" | "anthropic" | "google" | "mistral" | "meta",
    );
  };

  const handleNewChat = () => {
    const newThreadId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newThreadId,
      title: "New conversation",
      timestamp: new Date(),
      messages: [],
    };
    setThreads((prev) => [newThread, ...prev]);
    setCurrentThreadId(newThreadId);
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (currentThreadId === threadId) {
      setCurrentThreadId(undefined);
    }
  };

  const handleSubmit = async (message: string, provider: string) => {
    let threadId = currentThreadId;

    if (!threadId) {
      threadId = `thread-${Date.now()}`;
      const newThread: ChatThread = {
        id: threadId,
        title: message.slice(0, 50),
        timestamp: new Date(),
        messages: [],
      };
      setThreads((prev) => [newThread, ...prev]);
      setCurrentThreadId(threadId);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [...t.messages, userMessage],
              title: t.messages.length === 0 ? message.slice(0, 50) : t.title,
            }
          : t,
      ),
    );

    setInput("");
    setIsLoading(true);

    try {
      const thread = threads.find((t) => t.id === threadId);
      const apiMessages = (thread?.messages || [])
        .concat(userMessage)
        .filter((m) => m.role !== "tool")
        .map((m) => ({
          role:
            m.role === "user"
              ? ("user" as const)
              : m.role === "assistant"
                ? ("assistant" as const)
                : ("system" as const),
          content: m.content,
        }));

      const result = await sendMessage.mutateAsync({
        messages: apiMessages,
        provider: provider as any,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.content,
        timestamp: new Date(),
        provider: result.provider,
        isFallback: result.isFallback,
        modelDisplayName: result.modelDisplayName,
      };

      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, assistantMessage] }
            : t,
        ),
      );
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, errorMessage] }
            : t,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setCurrentThreadId(undefined);
  };

  const showHeader = !currentThreadId || currentMessages.length === 0;

  return (
    <div className="flex h-screen bg-zinc-950">
      <ChatSidebar
        onNewChat={handleNewChat}
        onSelectThread={handleSelectThread}
        onDeleteThread={handleDeleteThread}
        currentThreadId={currentThreadId}
      />

      <div className="flex-1 flex flex-col bg-zinc-950">
        {showHeader && <ChatHeader onPromptClick={handlePromptClick} />}

        {!showHeader && <ChatMessages messages={currentMessages} />}

        {isLoading && (
          <div className="px-6">
            <div className="max-w-4xl mx-auto">
              <TypingIndicator provider={selectedProvider} isFallback={false} />
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          <ChatInput
            value={input}
            onValueChange={setInput}
            onSubmit={handleSubmit}
            disabled={isLoading}
            selectedProvider={selectedProvider}
            onProviderChange={handleProviderChange}
          />
        </div>
      </div>
    </div>
  );
}
