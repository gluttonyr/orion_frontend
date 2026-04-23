import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Search, SlidersHorizontal, Star, ShoppingCart, Sparkles } from "lucide-react";
import { products, merchants } from "../lib/mock-data";

export function Marketplace() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("popular");

  // Déterminer si on est dans le dashboard ou la marketplace publique
  const isDashboard = location.pathname.startsWith("/dashboard");
  const productUrlPrefix = isDashboard ? "/dashboard/product" : "/product";

  const categories = ["Tous", "Électronique", "Alimentation", "Mode", "Équipement", "Beauté"];

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Tous" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0; // popular (default order)
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMerchant = (merchantId: string) => {
    return merchants.find((m) => m.id === merchantId);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome Banner - Only for public marketplace */}
      {!isDashboard && (
        <div className="bg-gradient-to-br from-primary via-blue-700 to-secondary p-8 md:p-12 text-white shadow-xl border-4 border-secondary">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                <Sparkles className="w-6 h-6" />
                <span className="text-sm font-medium bg-white/20 px-3 py-1 border-2 border-white/40">
                  Nouveau
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Bienvenue sur Orion Marketplace
              </h2>
              <p className="text-blue-100 text-lg mb-6">
                Découvrez des milliers de produits de qualité proposés par des commerçants et entrepreneurs africains
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white text-primary hover:bg-blue-50 transition-colors font-medium shadow-md inline-flex items-center justify-center gap-2 border-2 border-white"
                >
                  <span>Devenir vendeur</span>
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 bg-white/10 text-white hover:bg-white/20 transition-colors font-medium border-2 border-white/30 inline-flex items-center justify-center"
                >
                  <span>Se connecter</span>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="w-48 h-48 bg-white/10 border-4 border-white/20 flex items-center justify-center backdrop-blur-sm">
                <ShoppingCart className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-600 mt-1">Découvrez les produits des commerçants africains</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow-md p-6 border-2 border-gray-100 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 font-medium whitespace-nowrap transition-colors border-2 ${
                selectedCategory === category
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">Trier par:</span>
          <select
            title="Sélectionnez un critère de tri"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary transition-all">
            <option value="popular">Popularité</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="rating">Meilleure note</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const merchant = getMerchant(product.merchantId);
          return (
            <Link
              key={product.id}
              to={`${productUrlPrefix}/${product.id}`}
              className="bg-white shadow-md overflow-hidden border-4 border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group hover:border-primary"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 px-3 py-1 bg-white text-sm font-medium shadow-md border-2 border-gray-200">
                  {product.category}
                </div>
                {product.availability === "Stock limité" && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-sm font-medium shadow-md border-2 border-orange-600">
                    Stock limité
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Merchant Info */}
                {merchant && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary border-2 border-gray-200 flex items-center justify-center text-white text-xs font-medium">
                      {merchant.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{merchant.shopName}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">{merchant.rating} ({merchant.totalSales} ventes)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price and Stock */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
                    <p className="text-xs text-gray-500">{product.stock} en stock</p>
                  </div>
                  <div className="w-10 h-10 bg-primary border-2 border-primary flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="bg-white shadow-md p-12 text-center border-4 border-gray-100">
          <div className="w-16 h-16 bg-gray-100 border-4 border-gray-200 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
}
