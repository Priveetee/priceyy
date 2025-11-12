"use client";

import { ChatInput } from "./components/chat-input";
import { ChatHeader } from "./components/chat-header";
import { ChatSidebar } from "./components/chat-sidebar";
import { ChatMessages } from "./components/chat-messages";
import { TypingIndicator } from "./components/typing-indicator";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;
}

interface ChatThread {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

const THREADS_STORAGE_KEY = "priceyy-chat-threads";
const CURRENT_THREAD_KEY = "priceyy-current-thread";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("openai");

  useEffect(() => {
    const storedThreadId = localStorage.getItem(CURRENT_THREAD_KEY);
    if (storedThreadId) {
      setCurrentThreadId(storedThreadId);
      loadThreadMessages(storedThreadId);
    }
  }, []);

  const loadThreadMessages = (threadId: string) => {
    const threadsData = localStorage.getItem(THREADS_STORAGE_KEY);
    if (threadsData) {
      try {
        const threads: ChatThread[] = JSON.parse(threadsData);
        const thread = threads.find((t) => t.id === threadId);
        if (thread) {
          const messagesWithDates = thread.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(messagesWithDates);
        }
      } catch (error) {
        console.error("Failed to load thread messages:", error);
      }
    }
  };

  const saveThread = (threadId: string, newMessages: Message[]) => {
    const threadsData = localStorage.getItem(THREADS_STORAGE_KEY);
    let threads: ChatThread[] = threadsData ? JSON.parse(threadsData) : [];

    const existingThreadIndex = threads.findIndex((t) => t.id === threadId);

    const firstUserMessage = newMessages.find((m) => m.role === "user");
    const title = firstUserMessage
      ? firstUserMessage.content.slice(0, 50) +
        (firstUserMessage.content.length > 50 ? "..." : "")
      : "New conversation";

    const threadData: ChatThread = {
      id: threadId,
      title,
      timestamp: new Date(),
      messages: newMessages,
    };

    if (existingThreadIndex >= 0) {
      threads[existingThreadIndex] = threadData;
    } else {
      threads.unshift(threadData);
    }

    localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
  };

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: (data, variables) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
        provider: data.provider || variables.provider,
      };

      const updatedMessages = [...messages, assistantMessage];
      setMessages(updatedMessages);

      if (currentThreadId) {
        saveThread(currentThreadId, updatedMessages);
      }

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

    let threadId = currentThreadId;
    if (!threadId) {
      threadId = `thread-${Date.now()}`;
      setCurrentThreadId(threadId);
      localStorage.setItem(CURRENT_THREAD_KEY, threadId);
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    saveThread(threadId, updatedMessages);

    const chatMessages = updatedMessages.map((msg) => ({
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
    localStorage.removeItem(CURRENT_THREAD_KEY);
  };

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    localStorage.setItem(CURRENT_THREAD_KEY, threadId);
    loadThreadMessages(threadId);
  };

  const handleDeleteThread = (threadId: string) => {
    const threadsData = localStorage.getItem(THREADS_STORAGE_KEY);
    if (threadsData) {
      const threads: ChatThread[] = JSON.parse(threadsData);
      const updatedThreads = threads.filter((t) => t.id !== threadId);
      localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(updatedThreads));

      if (currentThreadId === threadId) {
        handleNewChat();
      }
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950">
      <ChatSidebar
        onNewChat={handleNewChat}
        onSelectThread={handleSelectThread}
        onDeleteThread={handleDeleteThread}
        currentThreadId={currentThreadId}
      />

      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <ChatHeader onPromptClick={handlePromptClick} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ChatMessages messages={messages} />
            {isLoading && (
              <div className="max-w-4xl mx-auto px-6">
                <TypingIndicator provider={selectedProvider as any} />
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <ChatInput
            value={input}
            onValueChange={setInput}
            onSubmit={handleSubmit}
            disabled={isLoading}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />
        </div>
      </div>
    </div>
  );
}
