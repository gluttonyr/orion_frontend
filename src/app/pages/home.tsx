import { Link } from "react-router";
import { ArrowRight, TrendingUp, Shield, Globe, ShoppingCart } from "lucide-react";
import { products } from "../lib/mock-data";
import { useCart } from "../lib/cart-context";
import { useState } from "react";

export function Home() {
  const featuredProducts = products.slice(0, 6);
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      seller: product.seller,
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner with Background Image */}
      <div className="relative overflow-hidden border-b-4 border-secondary">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop')",
          }}
        >
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 to-secondary/95"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                La Marketplace Africaine pour Entrepreneurs
              </h1>
              <p className="text-lg md:text-xl text-blue-100">
                Connectez-vous avec des milliers de commerçants à travers l'Afrique. 
                Achetez, vendez et développez votre business en toute confiance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl border-2 border-white"
                >
                  Explorer le Marketplace
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white font-semibold hover:bg-green-600 transition-all shadow-lg border-2 border-secondary"
                >
                  Devenir Vendeur
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-6 border-2 border-white/20">
                <div className="w-12 h-12 bg-white/20 border-2 border-white/40 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">5,000+</h3>
                <p className="text-blue-100">Produits disponibles</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 border-2 border-white/20">
                <div className="w-12 h-12 bg-white/20 border-2 border-white/40 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">100%</h3>
                <p className="text-blue-100">Paiement sécurisé</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 border-2 border-white/20">
                <div className="w-12 h-12 bg-white/20 border-2 border-white/40 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">15+</h3>
                <p className="text-blue-100">Pays africains</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 border-2 border-white/20">
                <div className="w-12 h-12 bg-white/20 border-2 border-white/40 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">2,000+</h3>
                <p className="text-blue-100">Commerçants actifs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Produits Populaires</h2>
            <p className="text-gray-600">Découvrez les produits les plus demandés du moment</p>
          </div>
          <Link
            to="/marketplace"
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium hover:bg-blue-700 transition-all border-2 border-primary"
          >
            Voir tout
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border-4 border-gray-200 overflow-hidden hover:border-primary transition-all shadow-sm hover:shadow-lg group"
            >
              <Link to={`/product/${product.id}`}>
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-primary font-medium border-2 border-blue-200">
                    {product.category}
                  </span>
                  <span className="text-xs text-green-600 font-medium">{product.availability}</span>
                </div>
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.rating})</span>
                </div>
                <p className="text-2xl font-bold text-primary mb-4">{formatCurrency(product.price)}</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-white font-semibold hover:bg-green-600 transition-all border-2 border-secondary"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Ajouter au panier
                </button>
                {addedToCart === product.id && (
                  <p className="mt-2 text-sm text-center font-medium text-secondary">✓ Ajouté au panier !</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden">
          <Link
            to="/marketplace"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-white font-medium hover:bg-blue-700 transition-all border-2 border-primary"
          >
            Voir tous les produits
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Features Section with African Patterns */}
      <div className="bg-gray-100 py-16 border-t-4 border-b-4 border-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Pourquoi choisir Orion ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 border-4 border-gray-200 hover:border-primary transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary border-4 border-gray-200 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Paiement Sécurisé</h3>
              <p className="text-gray-600">
                Transactions 100% sécurisées avec protection acheteur et vendeur. Vos données sont protégées.
              </p>
            </div>
            <div className="bg-white p-8 border-4 border-gray-200 hover:border-secondary transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary border-4 border-gray-200 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Opportunités de Croissance</h3>
              <p className="text-gray-600">
                Formations, micro-crédits et réseaux pour développer votre activité commerciale.
              </p>
            </div>
            <div className="bg-white p-8 border-4 border-gray-200 hover:border-primary transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary border-4 border-gray-200 flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Réseau Panafricain</h3>
              <p className="text-gray-600">
                Accédez à des marchés à travers toute l'Afrique et développez votre clientèle internationale.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-primary to-secondary p-8 md:p-12 relative overflow-hidden border-4 border-secondary">
          {/* Pattern décoratif */}
          <div className="absolute right-0 top-0 w-64 h-64 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="cta-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="15" fill="white" />
                <path d="M15,15 L35,35 M35,15 L15,35" stroke="white" strokeWidth="3" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#cta-pattern)" />
            </svg>
          </div>

          <div className="relative text-center text-white space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Prêt à développer votre business ?</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Rejoignez des milliers d'entrepreneurs africains qui font confiance à Orion pour faire grandir leur activité.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold hover:bg-gray-100 transition-all shadow-lg border-2 border-white"
              >
                Créer un compte
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white font-semibold hover:bg-green-600 transition-all border-2 border-white"
              >
                Explorer maintenant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}