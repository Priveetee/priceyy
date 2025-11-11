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

interface ChatThread {
    id: string;
    title: string;
    timestamp: Date;
    category: "today" | "yesterday" | "last7days" | "older";
}

interface ChatSidebarProps {
    onNewChat: () => void;
    onSelectThread: (threadId: string) => void;
    currentThreadId?: string;
}

const MOCK_THREADS: ChatThread[] = [
    {
        id: "1",
        title: "Compare AWS and Azure pricing",
        timestamp: new Date(),
        category: "today",
    },
    {
        id: "2",
        title: "Kubernetes cost estimation",
        timestamp: new Date(Date.now() - 86400000),
        category: "yesterday",
    },
    {
        id: "3",
        title: "Storage pricing comparison",
        timestamp: new Date(Date.now() - 2 * 86400000),
        category: "last7days",
    },
    {
        id: "4",
        title: "GPU instances pricing",
        timestamp: new Date(Date.now() - 3 * 86400000),
        category: "last7days",
    },
    {
        id: "5",
        title: "Database cost optimization",
        timestamp: new Date(Date.now() - 10 * 86400000),
        category: "older",
    },
];

const CATEGORY_LABELS = {
    today: "TODAY",
    yesterday: "YESTERDAY",
    last7days: "LAST 7 DAYS",
    older: "OLDER",
};

export function ChatSidebar({
    onNewChat,
    onSelectThread,
    currentThreadId,
}: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);

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

    const filteredThreads = MOCK_THREADS.filter((thread) =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const groupedThreads = filteredThreads.reduce(
        (acc, thread) => {
            if (!acc[thread.category]) {
                acc[thread.category] = [];
            }
            acc[thread.category].push(thread);
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
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search threads..."
                                    className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-300 placeholder:text-zinc-600 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {Object.entries(groupedThreads).map(
                                ([category, threads]) => (
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
                                            {threads.map((thread) => (
                                                <button
                                                    key={thread.id}
                                                    onClick={() =>
                                                        onSelectThread(
                                                            thread.id,
                                                        )
                                                    }
                                                    className={cn(
                                                        "group w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left",
                                                        currentThreadId ===
                                                            thread.id
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log(
                                                                "Delete thread:",
                                                                thread.id,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
