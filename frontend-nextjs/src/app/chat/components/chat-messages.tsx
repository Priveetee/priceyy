"use client";

import { MessageBubble } from "./message-bubble";
import { useEffect, useRef } from "react";

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

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  const displayMessages = messages.filter((m) => m.role !== "tool");

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {displayMessages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role as "user" | "assistant"}
            content={message.content}
            timestamp={message.timestamp}
            provider={message.provider}
            isFallback={message.isFallback}
            modelDisplayName={message.modelDisplayName}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
