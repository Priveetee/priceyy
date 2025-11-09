import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UIMessage } from "ai";

interface ChatState {
  messages: UIMessage[];
  setMessages: (messages: UIMessage[]) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const defaultModel = "openai/gpt-oss-20b:free";

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      setMessages: (messages) => set({ messages }),
      selectedModel: defaultModel,
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: "priceyy-chat-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
