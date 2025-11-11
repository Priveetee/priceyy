"use client";

import Silk from "@/components/silk";
import { ChatInput } from "./components/chat-input";
import { ChatHeader } from "./components/chat-header";
import { useState } from "react";

export default function ChatPage() {
    const [input, setInput] = useState("");
    const [hasStartedChat, setHasStartedChat] = useState(false);

    const handlePromptClick = (prompt: string) => {
        setInput(prompt);
    };

    const handleSubmit = (message: string, provider: string) => {
        console.log("Message:", message);
        console.log("Provider:", provider);
        setHasStartedChat(true);
    };

    return (
        <div className="relative flex flex-col h-screen w-full">
            <div className="absolute inset-0 z-[-1]">
                <Silk
                    color="#360707"
                    noiseIntensity={0.4}
                    scale={1.2}
                    speed={1.5}
                />
            </div>

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
    );
}
