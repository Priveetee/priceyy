"use client";

import { ChatInput } from "./components/chat-input";
import { ChatHeader } from "./components/chat-header";
import { ChatSidebar } from "./components/chat-sidebar";
import { useState } from "react";

export default function ChatPage() {
    const [input, setInput] = useState("");
    const [hasStartedChat, setHasStartedChat] = useState(false);
    const [currentThreadId, setCurrentThreadId] = useState<string>();

    const handlePromptClick = (prompt: string) => {
        setInput(prompt);
    };

    const handleSubmit = (message: string, provider: string) => {
        console.log("Message:", message);
        console.log("Provider:", provider);
        setHasStartedChat(true);
    };

    const handleNewChat = () => {
        setHasStartedChat(false);
        setInput("");
        setCurrentThreadId(undefined);
    };

    const handleSelectThread = (threadId: string) => {
        setCurrentThreadId(threadId);
        setHasStartedChat(true);
        console.log("Selected thread:", threadId);
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950" data-chat-page>
            <ChatSidebar
                onNewChat={handleNewChat}
                onSelectThread={handleSelectThread}
                currentThreadId={currentThreadId}
            />

            <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    {!hasStartedChat && (
                        <ChatHeader onPromptClick={handlePromptClick} />
                    )}
                </div>

                <div className="p-6">
                    <ChatInput
                        value={input}
                        onValueChange={setInput}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}
