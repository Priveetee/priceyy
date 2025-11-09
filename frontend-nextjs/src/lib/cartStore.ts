import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Usage {
  [unit: string]: number;
}

export interface CartItem {
  id: string;
  provider: string;
  region: string;
  resourceType: string;
  usage: Usage;
  count: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (itemToAdd: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateUsage: (itemId: string, newUsage: Usage) => void;
  updateCount: (itemId: string, newCount: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addToCart: (itemToAdd) =>
        set((state) => {
          console.log("[cartStore] addToCart called with:", itemToAdd);
          const newItems = [...state.items, itemToAdd];
          console.log("[cartStore] Added new item. New state:", newItems);
          return { items: newItems };
        }),
      removeFromCart: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),
      updateUsage: (itemId, newUsage) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, usage: newUsage } : item,
          ),
        })),
      updateCount: (itemId, newCount) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, count: newCount } : item,
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "priceyy-cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
