import { apiRequest } from './api';

export type AdminUser = { id: number; nom: string; prenom: string; email: string; role: string; contact?: string; localisation?: string; adresse?: string; pays?: string; image?: string; specialite?: string; date_naissance?: string };
export type AdminOrder = { id: number; reference: string; date_achat: string; prix_total: number; statut: string; utilisateur?: { nom?: string; prenom?: string; email?: string } | null; produits?: Array<{ nom: string }> };
export type AdminPlatformWallet = { solde: number; totalCommissions: number; totalRemboursements: number; updatedAt?: string | null };
export type SiteSettingsRecord = { heroImages: string[]; carouselProductIds: number[]; updatedAt?: string };
export type AdminMerchant = { id: number; nom: string; prenom: string; email: string };
export type AdminMerchantProduct = { id: number; nom: string; image?: string; prix: number; prixPromotionnel?: number | null; description?: string; statut: string; categorie?: { libellé?: string | null } | string | null; proprietaireId: number };
export type AboutTeamMember = { id: number; name: string; role: string; bio: string; photo?: string | null; position: number };
export type AdminDashboardStats = {
  users: number; merchants: number; products: number; publishedProducts: number;
  paidOrders: number; allOrders: number; revenue: number; averageOrder: number; totalLikes: number;
  userRoles: Array<{ name: string; value: number }>;
  monthlySales: Array<{ month: string; label: string; orders: number; revenue: number }>;
  topLikedProducts: Array<{ id: number; name: string; likes: number }>;
};

function auth(token: string): HeadersInit { return { Authorization: `Bearer ${token}` }; }

export const getAdminUsers = (token: string) => apiRequest<AdminUser[]>('/admin/users', { headers: auth(token) });
export const getAdminOrders = (token: string) => apiRequest<AdminOrder[]>('/admin/orders', { headers: auth(token) });
export const getAdminWallet = (token: string) => apiRequest<AdminPlatformWallet>('/admin/wallet', { headers: auth(token) });
export const getAdminDashboardStats = (token: string) => apiRequest<AdminDashboardStats>('/admin/dashboard-stats', { headers: auth(token) });
export const getSiteSettings = () => apiRequest<SiteSettingsRecord>('/site-settings');

export const getAdminMerchants = (token: string) => apiRequest<AdminMerchant[]>('/admin/merchants', { headers: auth(token) });
export const getAdminMerchantProducts = (token: string, merchantId: number) => apiRequest<AdminMerchantProduct[]>(`/admin/merchants/${merchantId}/products`, { headers: auth(token) });
export const getAdminCarouselProducts = (token: string) => apiRequest<AdminMerchantProduct[]>('/admin/carousel-products', { headers: auth(token) });

export function saveSiteSettings(token: string, heroFiles: File[], heroImages: string[], carouselProductIds: number[]) {
  const body = new FormData();
  body.append('heroImages', JSON.stringify(heroImages));
  body.append('carouselProductIds', JSON.stringify(carouselProductIds));
  heroFiles.forEach((file) => body.append('heroImagesFiles', file));
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
