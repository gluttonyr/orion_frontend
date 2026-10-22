import { apiRequest } from './api';

export type AdminUser = { id: number; nom: string; prenom: string; email: string; role: string; contact?: string; localisation?: string };
export type AdminOrder = { id: number; reference: string; date_achat: string; prix_total: number; statut: string; utilisateur?: { nom?: string; prenom?: string; email?: string } | null; produits?: Array<{ nom: string }> };
export type AdminPlatformWallet = { solde: number; totalCommissions: number; totalRemboursements: number; updatedAt?: string | null };
export type SiteSettingsRecord = { heroImages: string[]; carouselImages: string[]; updatedAt?: string };

function auth(token: string): HeadersInit { return { Authorization: `Bearer ${token}` }; }

export const getAdminUsers = (token: string) => apiRequest<AdminUser[]>('/admin/users', { headers: auth(token) });
export const getAdminOrders = (token: string) => apiRequest<AdminOrder[]>('/admin/orders', { headers: auth(token) });
export const getAdminWallet = (token: string) => apiRequest<AdminPlatformWallet>('/admin/wallet', { headers: auth(token) });
export const getSiteSettings = () => apiRequest<SiteSettingsRecord>('/site-settings');

export function saveSiteSettings(token: string, heroFiles: File[], carouselFiles: File[]) {
  const body = new FormData();
  heroFiles.forEach((file) => body.append('heroImagesFiles', file));
  carouselFiles.forEach((file) => body.append('carouselImagesFiles', file));
  return apiRequest<SiteSettingsRecord>('/admin/site-settings', { method: 'PUT', headers: auth(token), body });
}
