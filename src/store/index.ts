import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, Bundle, CartItem, User, MockTest, AudioSummaryAddon } from '@/types';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountAmount: number;
  addNote: (note: Note) => void;
  addBundle: (bundle: Bundle) => void;
  addTest: (test: MockTest) => void;
  addAudioSummary: (addon: AudioSummaryAddon) => void;
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
  isBundleModalOpen: boolean;
  bundleModalCount: number;
  bundleModalNoteId: string | null;
  activeCategory: string | null;
  searchQuery: string;
  isScholarAIOpen: boolean;
  toggleSidebar: () => void;
  toggleCart: () => void;
  setBundleModal: (isOpen: boolean, count: number, noteId?: string | null) => void;
  setActiveCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setScholarAI: (isOpen: boolean) => void;
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

      addTest: (test: MockTest) => {
        const { items } = get();
        const existingItem = items.find(item => item.type === 'test' && item.item.id === test.id);
        
        if (existingItem) return;

        set({
          items: [...items, { id: `test-${test.id}`, type: 'test', item: test, quantity: 1 }]
        });
      },

      addAudioSummary: (addon: AudioSummaryAddon) => {
        const { items } = get();
        const existingItem = items.find(item => item.type === 'audio' && (item.item as AudioSummaryAddon).id === addon.id);
        
        if (existingItem) return;

        set({
          items: [...items, { id: `audio-${addon.id}`, type: 'audio', item: addon, quantity: 1 }]
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
          let price = 0;
          if (item.type === 'note') price = (item.item as Note).price;
          else if (item.type === 'bundle') price = (item.item as Bundle).price;
          else if (item.type === 'test') price = (item.item as MockTest).price || 49;
          else if (item.type === 'audio') price = (item.item as AudioSummaryAddon).price || 49;
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
  isBundleModalOpen: false,
  bundleModalCount: 0,
  bundleModalNoteId: null,
  activeCategory: null,
  searchQuery: '',
  isScholarAIOpen: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setBundleModal: (isOpen, count, noteId = null) => set({ isBundleModalOpen: isOpen, bundleModalCount: count, bundleModalNoteId: noteId }),
  setActiveCategory: (category: string | null) => set({ activeCategory: category }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setScholarAI: (isOpen: boolean) => set({ isScholarAIOpen: isOpen }),
}));

interface WishlistState {
  items: Note[];
  add: (note: Note) => void;
  remove: (noteId: string | number) => void;
  toggle: (note: Note) => void;
  isWishlisted: (noteId: string | number) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (note: Note) => {
        const { items } = get();
        const already = items.some(item => item.id === note.id);
        if (already) return;
        set({ items: [...items, note] });
      },

      remove: (noteId: string | number) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== noteId) });
      },

      toggle: (note: Note) => {
        const { isWishlisted, add, remove } = get();
        if (isWishlisted(note.id)) {
          remove(note.id);
        } else {
          add(note);
        }
      },

      isWishlisted: (noteId: string | number) => {
        return get().items.some(item => item.id === noteId);
      },
    }),
    {
      name: 'edulaw-wishlist',
    }
  )
);
