import { create } from "zustand";

interface Usage {
  [unit: string]: number;
}

export interface CartItem {
  id: string;
  provider: string;
  region: string;
  resourceType: string;
  usage: Usage;
}

interface CartState {
  items: CartItem[];
  addToCart: (itemToAdd: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateUsage: (itemId: string, newUsage: Usage) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addToCart: (itemToAdd) =>
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.provider === itemToAdd.provider &&
          item.region === itemToAdd.region &&
          item.resourceType === itemToAdd.resourceType,
      );

      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        const existingItem = newItems[existingItemIndex];
        const newUsage = { ...existingItem.usage };

        for (const unit in itemToAdd.usage) {
          newUsage[unit] = (newUsage[unit] || 0) + itemToAdd.usage[unit];
        }

        newItems[existingItemIndex] = { ...existingItem, usage: newUsage };
        return { items: newItems };
      } else {
        return { items: [...state.items, itemToAdd] };
      }
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
  clearCart: () => set({ items: [] }),
}));
