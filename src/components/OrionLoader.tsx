// Loading state shared by every page: animated Orion logo with a short label for screen readers and sighted users.
export function OrionLoader({ label = "Chargement…", fullPage = false }: { label?: string; fullPage?: boolean }) {
  return <div className={`orion-loader ${fullPage ? "is-full-page" : ""}`} role="status" aria-live="polite">
    <span className="orion-loader-mark" aria-hidden="true"><i /><img src="/orion.jpeg" alt="" /></span>
    <span className="orion-loader-label">{label}</span>
  </div>;
}
