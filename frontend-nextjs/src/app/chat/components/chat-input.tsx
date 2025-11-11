"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiFillOpenAI } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { RiRobot2Line } from "react-icons/ri";
import { SiAnthropic, SiMeta } from "react-icons/si";

interface ChatInputProps {
    onSubmit: (message: string, provider: string) => void;
    disabled?: boolean;
}

const AI_PROVIDERS = [
    {
        id: "openai",
        name: "GPT",
        provider: "OpenAI",
        icon: AiFillOpenAI,
    },
    {
        id: "google",
        name: "Gemini",
        provider: "Google",
        icon: FcGoogle,
    },
    {
        id: "anthropic",
        name: "Claude",
        provider: "Anthropic",
        icon: SiAnthropic,
    },
    {
        id: "meta",
        name: "Llama",
        provider: "Meta",
        icon: SiMeta,
    },
    {
        id: "mistral",
        name: "Mistral",
        provider: "Mistral AI",
        icon: RiRobot2Line,
    },
];

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
    const [input, setInput] = useState("");
    const [selectedProvider, setSelectedProvider] = useState(
        AI_PROVIDERS[0].id,
    );
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [input]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || disabled) return;

        onSubmit(input, selectedProvider);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const selectedProviderData = AI_PROVIDERS.find(
        (p) => p.id === selectedProvider,
    );
    const SelectedIcon = selectedProviderData?.icon || RiRobot2Line;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="relative bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    rows={1}
                    className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent text-white placeholder:text-zinc-500 focus-visible:ring-0 px-6 py-4 text-base leading-6"
                    disabled={disabled}
                />

                <div className="flex items-center justify-between px-4 pb-3 pt-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 bg-transparent hover:bg-zinc-800/50 text-zinc-300 text-sm rounded-lg px-3 py-2 transition-colors outline-none">
                            <SelectedIcon className="h-5 w-5" />
                            <span className="font-medium">
                                {selectedProviderData?.name}
                            </span>
                            <svg
                                className="h-4 w-4 opacity-50"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="w-[240px] bg-zinc-900/95 backdrop-blur-xl border-zinc-800 rounded-2xl p-2 shadow-2xl"
                        >
                            {AI_PROVIDERS.map((provider) => {
                                const Icon = provider.icon;
                                const isSelected =
                                    provider.id === selectedProvider;
                                return (
                                    <DropdownMenuItem
                                        key={provider.id}
                                        onClick={() =>
                                            setSelectedProvider(provider.id)
                                        }
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            {isSelected ? (
                                                <Check className="h-5 w-5 text-white flex-shrink-0" />
                                            ) : (
                                                <div className="h-5 w-5 flex-shrink-0" />
                                            )}
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium text-white">
                                                    {provider.name}
                                                </span>
                                                <span className="text-xs text-zinc-500">
                                                    {provider.provider}
                                                </span>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={disabled || !input.trim()}
                        size="sm"
                        className="bg-white hover:bg-zinc-200 text-black font-medium rounded-xl h-9 w-9 p-0 disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
