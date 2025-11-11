"use client";

import { DollarSign, BarChart3, Search, Calculator } from "lucide-react";
import { useState } from "react";

interface ChatHeaderProps {
    onPromptClick: (prompt: string) => void;
}

const CATEGORIES = [
    { id: "compare", label: "Compare", icon: BarChart3 },
    { id: "search", label: "Search", icon: Search },
    { id: "estimate", label: "Estimate", icon: DollarSign },
    { id: "calculate", label: "Calculate", icon: Calculator },
];

const PROMPTS_BY_CATEGORY: Record<string, string[]> = {
    compare: [
        "Compare AWS, Azure, and GCP pricing for compute instances",
        "What's the difference between AWS EC2 and Azure VMs pricing?",
        "Which cloud provider is cheapest for storage?",
        "Compare serverless pricing across providers",
    ],
    search: [
        "Find the cheapest database options across all providers",
        "Search for Kubernetes pricing in different regions",
        "What are the pricing options for object storage?",
        "Show me all GPU instance pricing",
    ],
    estimate: [
        "Estimate costs for a web application deployment",
        "How much does it cost to run a Kubernetes cluster?",
        "Calculate costs for 1TB of data transfer",
        "Estimate monthly costs for a startup MVP",
    ],
    calculate: [
        "Calculate the cost difference between reserved and on-demand instances",
        "What's the ROI of switching to spot instances?",
        "Calculate savings with committed use discounts",
        "Compare total cost of ownership across providers",
    ],
};

export function ChatHeader({ onPromptClick }: ChatHeaderProps) {
    const [selectedCategory, setSelectedCategory] = useState("compare");

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
            <div className="w-full max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const isSelected = selectedCategory === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${
                                    isSelected
                                        ? "bg-zinc-700 text-white"
                                        : "bg-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {category.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-0">
                    {PROMPTS_BY_CATEGORY[selectedCategory].map(
                        (prompt, index) => (
                            <div key={index}>
                                <button
                                    onClick={() => onPromptClick(prompt)}
                                    className="w-full text-left text-zinc-300 hover:text-white transition-colors py-4 text-base"
                                >
                                    {prompt}
                                </button>
                                {index <
                                    PROMPTS_BY_CATEGORY[selectedCategory]
                                        .length -
                                        1 && (
                                    <div className="border-t border-zinc-800/50" />
                                )}
                            </div>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}
