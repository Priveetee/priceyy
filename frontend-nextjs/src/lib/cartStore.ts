import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  provider: string;
  region: string;
  resourceType: string;
  priceModel: string;
  unitOfMeasure: string;
  pricePerUnit: number;
  usageQuantity: number;
  count: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (itemToAdd: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateItem: (
    itemId: string,
    update: Partial<Pick<CartItem, "usageQuantity" | "count">>,
  ) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addToCart: (itemToAdd) =>
        set((state) => ({ items: [...state.items, itemToAdd] })),
      removeFromCart: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),
      updateItem: (itemId, update) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, ...update } : item,
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
