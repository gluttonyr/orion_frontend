import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { OrionBrand } from "../components/OrionBrand";
import "../password-reset.css";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="not-found-shell">
      <header><OrionBrand /></header>
      <div className="not-found-center">
        <span className="not-found-code">404</span>
        <h1>Page introuvable</h1>
        <p>La page que vous cherchez n’existe pas ou a été déplacée. Revenez à l’accueil ou explorez la marketplace Orion.</p>
        <div className="not-found-actions">
          <Link to="/" className="public-primary-button"><ArrowLeft size={16} /> Retour à l’accueil</Link>
          <Link to="/marketplace" className="public-secondary-button"><Compass size={16} /> Explorer la marketplace</Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
