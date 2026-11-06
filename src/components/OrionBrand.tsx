import { Link } from "react-router-dom";

/**
 * Logo Orion (pictogramme + nom) utilisé dans l'en-tête de chaque page.
 * `tone="light"` pour les fonds bordeaux, `compact` pour n'afficher que le pictogramme.
 */
export function OrionBrand({ to = "/", tone = "dark", compact = false, className = "", onClick }: { to?: string; tone?: "dark" | "light"; compact?: boolean; className?: string; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick} className={`orion-brand orion-brand-${tone} ${compact ? "is-compact" : ""} ${className}`.trim()} aria-label="Orion — retour à l’accueil">
      <img src="/orion.jpeg" alt="" className="orion-brand-mark" />
      {compact ? null : <span className="orion-brand-text"><strong>ORION</strong><small>Commerce · Opportunités</small></span>}
    </Link>
  );
}
