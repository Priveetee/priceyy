"use client";

import Silk from "@/components/silk";
import { ChatInput } from "./components/chat-input";

export default function ChatPage() {
    const handleSubmit = (message: string, model: string) => {
        console.log("Message:", message);
        console.log("Model:", model);
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
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-4xl font-bold text-white">
                        AI Assistant
                    </h1>
                    <p className="text-zinc-400 mt-2">Ask me anything</p>
                </div>
            </div>

            <div className="p-6">
                <ChatInput onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
