import { Outlet, Link } from "react-router";
import { ShoppingCart, LogIn, Home, Store, Briefcase } from "lucide-react";
import { useCart } from "../lib/cart-context";

export function PublicLayout() {
  const { getTotalItems } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-4 border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <div>
                <span className="text-2xl font-semibold text-primary">Orion</span>
                <p className="text-xs text-gray-500 hidden sm:block">Marketplace africaine</p>
              </div>
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                <span>Accueil</span>
              </Link>
              <Link
                to="/marketplace"
                className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium"
              >
                <Store className="w-4 h-4" />
                <span>Marketplace</span>
              </Link>
              <Link
                to="/opportunities"
                className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium"
              >
                <Briefcase className="w-4 h-4" />
                <span>Opportunités</span>
              </Link>
            </nav>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              {/* Cart Icon */}
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs border-2 border-secondary flex items-center justify-center font-medium">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

              {/* Login Button */}
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg border-2 border-primary"
              >
                <LogIn className="w-5 h-5" />
                <span>Connexion</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t-4 border-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">O</span>
                </div>
                <span className="text-2xl font-semibold">Orion</span>
              </div>
              <p className="text-gray-400 text-sm">
                La plateforme qui connecte les entrepreneurs africains pour un commerce équitable et transparent.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link to="/opportunities" className="hover:text-white transition-colors">Opportunités</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">S'inscrire</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Connexion</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nous contacter</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suivez-nous</h3>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary flex items-center justify-center border-2 border-gray-700 hover:border-primary transition-all">
                  <span className="text-white font-semibold">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary flex items-center justify-center border-2 border-gray-700 hover:border-primary transition-all">
                  <span className="text-white font-semibold">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-primary flex items-center justify-center border-2 border-gray-700 hover:border-primary transition-all">
                  <span className="text-white font-semibold">in</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Orion. Tous droits réservés. Fait avec ❤️ en Afrique.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}