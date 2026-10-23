import { apiRequest } from './api';

export type AdminUser = { id: number; nom: string; prenom: string; email: string; role: string; contact?: string; localisation?: string };
export type AdminOrder = { id: number; reference: string; date_achat: string; prix_total: number; statut: string; utilisateur?: { nom?: string; prenom?: string; email?: string } | null; produits?: Array<{ nom: string }> };
export type AdminPlatformWallet = { solde: number; totalCommissions: number; totalRemboursements: number; updatedAt?: string | null };
export type SiteSettingsRecord = { heroImages: string[]; carouselImages: string[]; updatedAt?: string };
export type AboutTeamMember = { id: number; name: string; role: string; bio: string; photo?: string | null; position: number };

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

export const getAboutTeam = () => apiRequest<AboutTeamMember[]>('/about/team');
export const saveAboutTeamMember = (token: string, data: { name: string; role: string; bio: string; position: number; photo?: File }, id?: number) => {
  const body = new FormData();
  body.append('name', data.name); body.append('role', data.role); body.append('bio', data.bio); body.append('position', String(data.position));
  if (data.photo) body.append('photo', data.photo);
  return apiRequest<AboutTeamMember>(id ? `/admin/about/team/${id}` : '/admin/about/team', { method: id ? 'PATCH' : 'POST', headers: auth(token), body });
};
export const deleteAboutTeamMember = (token: string, id: number) => apiRequest<{ success: boolean }>(`/admin/about/team/${id}`, { method: 'DELETE', headers: auth(token) });
