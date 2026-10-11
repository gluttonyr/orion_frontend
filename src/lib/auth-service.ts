import { apiRequest } from "./api";

export type AuthUser = {
  id: number;
  nom?: string;
  prenom?: string;
  email: string;
  role: "UTILISATEUR" | "COMMERCANT" | "ADMIN";
  contact?: string;
  specialite?: string;
  localisation?: string;
  adresse?: string;
  date_naissance?: string;
  image?: string;
};

export type AuthResponse = {
  access_token: string;
  user: AuthUser;
};

export async function loginUser(email: string, password: string) {
  return apiRequest<AuthResponse>("/utilisateur/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(payload: Record<string, unknown>) {
  return apiRequest<AuthResponse>("/utilisateur/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(token: string) {
  return apiRequest<AuthUser>("/utilisateur/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateUser(id: number, payload: FormData, token: string) {
  return apiRequest<AuthUser>(`/utilisateur/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  });
}
