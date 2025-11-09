"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useChatStore } from "@/lib/chatStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, X, Send, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ScrollToBottom from "react-scroll-to-bottom";
import { MarkdownResponse } from "@/components/markdown-response";

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages: persistedMessages, setMessages: setPersistedMessages } =
    useChatStore();

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    messages: persistedMessages,
  });

  const [input, setInput] = useState("");

  useEffect(() => {
    setPersistedMessages(messages);
  }, [messages, setPersistedMessages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[600px] h-[75vh] origin-bottom-right max-w-[90vw] max-h-[85vh]"
          >
            <Card className="h-full flex flex-col bg-slate-950 border-slate-800 shadow-2xl rounded-lg">
              <CardHeader className="flex-row items-center justify-between py-3 px-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Bot className="text-slate-300 h-5 w-5" />
                  <CardTitle className="text-slate-200 text-base">
                    AI Assistant
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4 text-slate-400" />
                </Button>
              </CardHeader>

              <ScrollToBottom
                className="flex-1 min-h-0"
                scrollViewClassName="p-4"
              >
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex items-start gap-3 w-full",
                        m.role === "user" && "flex-row-reverse",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
                          m.role === "user"
                            ? "bg-slate-700 text-slate-200"
                            : "bg-slate-800 text-slate-300",
                        )}
                      >
                        {m.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-full rounded-lg px-3 py-2 text-sm",
                          m.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-300",
                        )}
                      >
                        <MarkdownResponse>
                          {m.parts
                            .filter((p) => p.type === "text")
                            .map((p: any) => p.text)
                            .join("")}
                        </MarkdownResponse>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollToBottom>

              <div className="border-t border-slate-800 p-4 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for advice..."
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={status !== "ready"}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={() => setIsOpen(true)}
            size="icon"
            className="rounded-full h-14 w-14 shadow-lg"
          >
            <Bot />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
