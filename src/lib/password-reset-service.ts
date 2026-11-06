import { apiRequest } from "./api";

export type ForgotPasswordResponse = { message: string; expiresInMinutes: number; resendInSeconds: number };
export type VerifyCodeResponse = { resetToken: string; expiresInMinutes: number };

const post = <T,>(path: string, body: object) => apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) });

export const requestPasswordReset = (email: string) => post<ForgotPasswordResponse>("/utilisateur/password/forgot", { email });
export const verifyPasswordResetCode = (email: string, code: string) => post<VerifyCodeResponse>("/utilisateur/password/verify", { email, code });
export const resetPassword = (email: string, resetToken: string, password: string) => post<{ message: string }>("/utilisateur/password/reset", { email, resetToken, password });

/**
 * État du parcours conservé dans sessionStorage : il survit à un rechargement de page
 * mais disparaît à la fermeture de l'onglet (le jeton de réinitialisation n'est jamais persisté au-delà).
 */
export type PasswordResetFlow = { email: string; codeSentAt?: number; resendInSeconds?: number; expiresInMinutes?: number; resetToken?: string; tokenExpiresAt?: number };
const FLOW_KEY = "orion-password-reset";

export function readResetFlow(): PasswordResetFlow | null {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(FLOW_KEY) ?? "null") as PasswordResetFlow | null;
    return value && typeof value.email === "string" ? value : null;
  } catch {
    return null;
  }
}

export function writeResetFlow(flow: PasswordResetFlow) {
  try { window.sessionStorage.setItem(FLOW_KEY, JSON.stringify(flow)); } catch { /* navigation privée : l'état reste en mémoire de page */ }
}

export function clearResetFlow() {
  try { window.sessionStorage.removeItem(FLOW_KEY); } catch { /* ignore */ }
}

/** Score 0–4 et conseils, identiques aux règles du backend (8 caractères, une lettre, un chiffre). */
export function passwordStrength(password: string) {
  const checks = [
    { label: "8 caractères minimum", ok: password.length >= 8 },
    { label: "Une lettre", ok: /[A-Za-z]/.test(password) },
    { label: "Un chiffre", ok: /\d/.test(password) },
    { label: "Une majuscule ou un symbole", ok: /[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((check) => check.ok).length + (password.length >= 12 ? 1 : 0);
  const level = password ? Math.min(4, Math.max(1, score - 1)) : 0;
  const labels = ["", "Faible", "Moyen", "Bon", "Excellent"];
  return { checks, level, label: labels[level], valid: checks.slice(0, 3).every((check) => check.ok) };
}
