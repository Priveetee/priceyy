import { create } from "zustand";

interface Resource {
  id: string;
  name: string;
  count: number;
}

interface CartState {
  items: Resource[];
  addToCart: (resource: Resource) => void;
  removeFromCart: (resourceId: string) => void;
  updateQuantity: (resourceId: string, newCount: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>(set => ({
  items: [],
  addToCart: resourceToAdd =>
    set(state => {
      const existingItem = state.items.find(
        item => item.name === resourceToAdd.name
      );
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.name === resourceToAdd.name
              ? { ...item, count: item.count + resourceToAdd.count }
              : item
          )
        };
      } else {
        return { items: [...state.items, resourceToAdd] };
      }
    }),
  removeFromCart: resourceId =>
    set(state => ({
      items: state.items.filter(item => item.id !== resourceId)
    })),
  updateQuantity: (resourceId, newCount) =>
    set(state => ({
      items: state.items.map(item =>
        item.id === resourceId ? { ...item, count: newCount } : item
      )
    })),
  clearCart: () => set({ items: [] })
}));
