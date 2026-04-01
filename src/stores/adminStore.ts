import { create } from 'zustand';
import type { AdminRole } from '../constants/adminRoles';

// DO NOT use persist middleware — admin state should 
// not survive page refresh for security

interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AdminStore {
  // Sidebar state
  sidebarCollapsed: boolean;
  activePath: string;
  
  // Admin user
  adminUser: any | null; 
  adminRole: AdminRole | null;
  
  // Global admin notifications
  notifications: Notification[];
  
  // Pending action tracking (for optimistic updates)
  pendingActions: Record<string, boolean>;
  
  // Actions
  setSidebarCollapsed: (v: boolean) => void;
  setActivePath: (path: string) => void;
  setAdminUser: (user: any, role: AdminRole | null) => void;
  addNotification: (n: Omit<Notification, 'id'>) => void;
  removeNotification: (id: number) => void;
  setPendingAction: (key: string, isPending: boolean) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  // Sidebar state
  sidebarCollapsed: false,
  activePath: '',
  
  // Admin user (populated by AdminGuard)
  adminUser: null,
  adminRole: null,
  
  // Global admin notifications
  notifications: [],
  
  // Pending action tracking
  pendingActions: {},
  
  // Actions
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setActivePath: (path) => set({ activePath: path }),
  setAdminUser: (user, role) => set({ adminUser: user, adminRole: role }),
  addNotification: (n) => set(s => ({ 
    notifications: [...s.notifications, { ...n, id: Date.now() }] 
  })),
  removeNotification: (id) => set(s => ({ 
    notifications: s.notifications.filter(n => n.id !== id) 
  })),
  setPendingAction: (key, isPending) => set(s => ({
    pendingActions: { ...s.pendingActions, [key]: isPending }
  }))
}));
