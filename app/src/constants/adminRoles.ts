export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',      // Full access — all modules
  CONTENT_MANAGER: 'content_manager', // Notes, Templates, Blog, FAQs only
  SUPPORT_AGENT: 'support_agent',   // Users, Orders (view), Refunds only
  FINANCE: 'finance',               // Orders, Reports, Subscriptions only
  MODERATOR: 'moderator',          // Community only
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ['*'],
  content_manager: ['notes', 'bundles', 'templates', 'mock-tests', 'blog', 'faqs', 'pages', 'storefront'],
  support_agent: ['users', 'orders.view', 'orders.refund', 'referrals'],
  finance: ['orders', 'subscriptions', 'reports', 'coupons'],
  moderator: ['community'],
};
