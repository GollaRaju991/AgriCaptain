/**
 * Subdomain detection for admin panel isolation.
 *
 * - admin.yourdomain.com  → admin app only (customer routes hidden)
 * - yourdomain.com        → customer app only
 *
 * Treats Lovable preview/sandbox hosts and localhost as "main app" so the
 * existing /admin/login URL keeps working in development & preview.
 */

export const isAdminSubdomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();

  if (host === 'localhost' || host === '127.0.0.1') return false;
  if (host.endsWith('.lovable.app') || host.endsWith('.lovableproject.com')) return false;
  if (host.endsWith('.sandbox.lovable.dev')) return false;

  return host.startsWith('admin.');
};

/**
 * Returns the correct admin path depending on context.
 *  - On admin subdomain:  adminPath('login')   → '/login'
 *  - On main domain:      adminPath('login')   → '/admin/login'
 */
export const adminPath = (sub: '' | 'login' | 'orders' | 'sellers' | 'farmers' | 'products' | 'crops'): string => {
  const onAdmin = isAdminSubdomain();
  if (onAdmin) return sub ? `/${sub}` : '/';
  return sub ? `/admin/${sub}` : '/admin';
};
