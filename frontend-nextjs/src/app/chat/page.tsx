"use client";

import { ChatInput } from "./components/chat-input";
import { ChatHeader } from "./components/chat-header";
import { ChatSidebar } from "./components/chat-sidebar";
import { ChatMessages } from "./components/chat-messages";
import { TypingIndicator } from "./components/typing-indicator";
import { ToolCallIndicator } from "./components/tool-call-indicator";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { useToolExecutor } from "./hooks/use-tool-executor";

interface Message {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  timestamp: Date;
  provider?: string;
  tool_call_id?: string;
  tool_calls?: any[];
  isFallback?: boolean;
  modelDisplayName?: string;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [currentToolCall, setCurrentToolCall] = useState<{
    toolName: string;
    args?: Record<string, any>;
  } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  const { executeToolCall } = useToolExecutor();
  const sendMessage = trpc.chat.sendMessage.useMutation();

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

  const processAIResponse = async (userMessage: Message, threadId: string) => {
    let conversationMessages = [...messages, userMessage];
    let continueLoop = true;
    let loopCount = 0;
    const maxLoops = 10;

    while (continueLoop && loopCount < maxLoops) {
      loopCount++;

      const chatMessages = conversationMessages
        .filter((m) => m.role !== "tool" || m.tool_call_id)
        .map((msg) => ({
          role: msg.role as "user" | "assistant" | "system" | "tool",
          content: msg.content,
          tool_call_id: msg.tool_call_id,
          tool_calls: msg.tool_calls,
        }));

      const result = await sendMessage.mutateAsync({
        messages: chatMessages,
        provider: selectedProvider as any,
      });

      if (result.isFallback) {
        setIsFallbackActive(true);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.info(
          `Server overloaded. Switching to ${result.modelDisplayName}`,
          {
            duration: 4000,
            icon: "🐟",
          },
        );

        setIsFallbackActive(false);
      }

      if (result.toolCalls && result.toolCalls.length > 0) {
        setIsTyping(false);

        const assistantMessageWithTools: Message = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: result.content || "",
          timestamp: new Date(),
          provider: result.originalProvider || selectedProvider,
          tool_calls: result.toolCalls,
          isFallback: result.isFallback,
          modelDisplayName: result.modelDisplayName,
        };

        conversationMessages.push(assistantMessageWithTools);

        for (const toolCall of result.toolCalls) {
          setCurrentToolCall({
            toolName: toolCall.function.name,
            args: JSON.parse(toolCall.function.arguments),
          });

          await new Promise((resolve) => setTimeout(resolve, 800));

          const toolResult = await executeToolCall(
            toolCall.function.name,
            toolCall.function.arguments,
          );

          const toolMessage: Message = {
            id: `${Date.now()}-tool-${toolCall.id}`,
            role: "tool",
            content: JSON.stringify(toolResult),
            timestamp: new Date(),
            tool_call_id: toolCall.id,
          };

          conversationMessages.push(toolMessage);
          setCurrentToolCall(null);
        }

        setIsTyping(true);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const assistantMessage: Message = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: result.content,
          timestamp: new Date(),
          provider: result.originalProvider || selectedProvider,
          isFallback: result.isFallback,
          modelDisplayName: result.modelDisplayName,
        };

        conversationMessages.push(assistantMessage);
        setIsTyping(false);
        setIsFallbackActive(false);
        continueLoop = false;
      }
    }

    const displayMessages = conversationMessages.filter(
      (m) => m.role !== "tool",
    );

    setMessages(displayMessages);
    saveThread(threadId, displayMessages);
    setIsTyping(false);
    setIsFallbackActive(false);
    setCurrentToolCall(null);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSubmit = async (message: string, provider: string) => {
    if (!message.trim() || isProcessing) return;

    setSelectedProvider(provider);

    const userMessage: Message = {
      id: `${Date.now()}-user`,
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

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    setIsTyping(true);
    setIsFallbackActive(false);

    try {
      await processAIResponse(userMessage, threadId);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
      setIsTyping(false);
      setIsFallbackActive(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setCurrentThreadId(undefined);
    setCurrentToolCall(null);
    setIsTyping(false);
    setIsFallbackActive(false);
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

            {currentToolCall && (
              <div className="max-w-4xl mx-auto px-6">
                <ToolCallIndicator
                  provider={selectedProvider as any}
                  toolName={currentToolCall.toolName as any}
                  args={currentToolCall.args}
                />
              </div>
            )}

            {isTyping && !currentToolCall && (
              <div className="max-w-4xl mx-auto px-6">
                <TypingIndicator
                  provider={selectedProvider as any}
                  isFallback={isFallbackActive}
                />
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <ChatInput
            value={input}
            onValueChange={setInput}
            onSubmit={handleSubmit}
            disabled={isProcessing}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
          />
        </div>
      </div>
    </div>
  );
}
