import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, Bundle, CartItem, User } from '@/types';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountAmount: number;
  addNote: (note: Note) => void;
  addBundle: (bundle: Bundle) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

interface UIState {
  isSidebarOpen: boolean;
  isCartOpen: boolean;
  activeCategory: string | null;
  searchQuery: string;
  toggleSidebar: () => void;
  toggleCart: () => void;
  setActiveCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discountAmount: 0,

      addNote: (note: Note) => {
        const { items } = get();
        const existingItem = items.find(item => item.type === 'note' && item.item.id === note.id);
        
        if (existingItem) {
          return;
        }

        set({
          items: [...items, { id: `note-${note.id}`, type: 'note', item: note, quantity: 1 }]
        });
      },

      addBundle: (bundle: Bundle) => {
        const { items } = get();
        const existingItem = items.find(item => item.type === 'bundle' && item.item.id === bundle.id);
        
        if (existingItem) {
          return;
        }

        set({
          items: [...items, { id: `bundle-${bundle.id}`, type: 'bundle', item: bundle, quantity: 1 }]
        });
      },

      removeItem: (id: string) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== id) });
      },

      clearCart: () => {
        set({ items: [], couponCode: null, discountAmount: 0 });
      },

      applyCoupon: (code: string, discount: number) => {
        set({ couponCode: code, discountAmount: discount });
      },

      removeCoupon: () => {
        set({ couponCode: null, discountAmount: 0 });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.type === 'note' 
            ? (item.item as Note).price 
            : (item.item as Bundle).price;
          return total + price * item.quantity;
        }, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discountAmount;
        return Math.max(0, subtotal - discount);
      },
    }),
    {
      name: 'edulaw-cart',
    }
  )
);

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      login: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      },
    }),
    {
      name: 'edulaw-user',
    }
  )
);

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: false,
  isCartOpen: false,
  activeCategory: null,
  searchQuery: '',

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setActiveCategory: (category: string | null) => set({ activeCategory: category }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));
