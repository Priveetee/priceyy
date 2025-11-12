"use client";

import { Plus, Search, Trash2, PanelLeftClose, PanelLeft } from "lucide-react";
import { TbMessage } from "react-icons/tb";
import { SiBruno } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
  category?: "today" | "yesterday" | "last7days" | "older";
}

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  currentThreadId?: string;
}

const CATEGORY_LABELS = {
  today: "TODAY",
  yesterday: "YESTERDAY",
  last7days: "LAST 7 DAYS",
  older: "OLDER",
};

const STORAGE_KEY = "priceyy-chat-threads";

function getCategoryFromDate(date: Date): ChatThread["category"] {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "yesterday";
  if (diffInDays <= 7) return "last7days";
  return "older";
}

export function ChatSidebar({
  onNewChat,
  onSelectThread,
  onDeleteThread,
  currentThreadId,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    const loadThreads = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const threadsWithCategories = parsed.map((thread: ChatThread) => ({
            ...thread,
            timestamp: new Date(thread.timestamp),
            category: getCategoryFromDate(new Date(thread.timestamp)),
          }));
          setThreads(threadsWithCategories);
        } catch (error) {
          console.error("Failed to parse stored threads:", error);
        }
      } else {
        setThreads([]);
      }
    };

    loadThreads();

    const interval = setInterval(loadThreads, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteThread(threadId);
  };

  const filteredThreads = threads.filter((thread) =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedThreads = filteredThreads.reduce(
    (acc, thread) => {
      const category = thread.category || "older";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(thread);
      return acc;
    },
    {} as Record<string, ChatThread[]>,
  );

  return (
    <AnimatePresence initial={false}>
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="border-r border-zinc-800 bg-zinc-950 flex flex-col h-screen overflow-hidden"
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center py-4 gap-4">
            <Link href="/" aria-label="Go to homepage">
              <SiBruno className="h-8 w-8 text-zinc-300 transition-colors hover:text-white" />
            </Link>
            <div className="border-b border-zinc-800 w-8" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(false)}
              className="text-zinc-400 hover:text-white"
              title="Expand sidebar (Ctrl+B)"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="text-zinc-400 hover:text-white"
              title="New chat"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col h-full"
          >
            <div className="p-4 space-y-3 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <Link href="/" aria-label="Go to homepage">
                  <SiBruno className="h-8 w-8 text-zinc-300 transition-colors hover:text-white" />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(true)}
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  title="Collapse sidebar (Ctrl+B)"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={onNewChat}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search threads..."
                  className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-300 placeholder:text-zinc-600 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {Object.keys(groupedThreads).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 px-4 text-center">
                  <TbMessage className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No chat history yet</p>
                  <p className="text-xs mt-1">Start a new conversation</p>
                </div>
              ) : (
                Object.entries(groupedThreads).map(
                  ([category, categoryThreads]) => (
                    <div key={category} className="py-3">
                      <div className="px-4 mb-2">
                        <h3 className="text-xs font-medium text-zinc-500">
                          {
                            CATEGORY_LABELS[
                              category as keyof typeof CATEGORY_LABELS
                            ]
                          }
                        </h3>
                      </div>
                      <div className="space-y-1 px-2">
                        {categoryThreads.map((thread) => (
                          <button
                            key={thread.id}
                            onClick={() => onSelectThread(thread.id)}
                            className={cn(
                              "group w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left",
                              currentThreadId === thread.id
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300",
                            )}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <TbMessage className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm truncate">
                                {thread.title}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                              onClick={(e) => handleDeleteThread(thread.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </button>
                        ))}
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
