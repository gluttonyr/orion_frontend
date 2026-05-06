import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Search, SlidersHorizontal, Star, ShoppingCart, Sparkles, AlertCircle } from "lucide-react";
import { produitService } from "../service/produit.service";
import { useImage } from "../lib/image-context";
import type { produits } from "../model/model";
  // Imports à ajouter
import { categorieService } from "../service/categorie.service";
import type { Categorie } from "../model/model";

export function Marketplace() {
  const location = useLocation();
  const { getBoutiqueImageUrl } = useImage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("popular");
  const [produitsList, setProduitsList] = useState<produits[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDashboard = location.pathname.startsWith("/dashboard");
  const productUrlPrefix = isDashboard ? "/dashboard/product" : "/product";



// Dans le composant, ajouter un state pour les catégories
const [categories, setCategories] = useState<Categorie[]>([]);

// Dans le useEffect (ou un useEffect séparé)
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const data = await categorieService.getAll();
      setCategories(data);
    } catch (err) {
      console.error("Erreur chargement catégories:", err);
    }
  };
  fetchCategories();
}, []);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await produitService.getAll();
        setProduitsList(data);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduits();
  }, []);

  
// Le filtre de produits — CORRIGER :
// const matchesCategory = selectedCategory === "Tous" || 
//   product.categorie?.libellé === selectedCategory;

  const filteredProduits = produitsList
    .filter((product) => {
      const matchesSearch = product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Tous" || product.categorie?.libellé === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.prix - b.prix;
      if (sortBy === "price-desc") return b.prix - a.prix;
      return 0;
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {!isDashboard && (
        <div className="bg-gradient-to-br from-primary via-blue-700 to-secondary p-8 md:p-12 text-white shadow-xl border-4 border-secondary">
          {/* ... votre banner existant, inchangé ... */}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-600 mt-1">Découvrez les produits des commerçants africains</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white shadow-md p-6 border-2 border-gray-100 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
  <SlidersHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0" />
  
  {/* Bouton "Tous" */}
  <button
    onClick={() => setSelectedCategory("Tous")}
    className={`px-4 py-2 font-medium whitespace-nowrap transition-colors border-2 ${
      selectedCategory === "Tous"
        ? "bg-primary text-white border-primary"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
    }`}
  >
    Tous
  </button>

  {/* Catégories depuis le backend */}
  {categories.map((cat) => (
    <button
      key={cat.id}
      onClick={() => setSelectedCategory(cat.libellé)}
      className={`px-4 py-2 font-medium whitespace-nowrap transition-colors border-2 ${
        selectedCategory === cat.libellé
          ? "bg-primary text-white border-primary"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
      }`}
    >
      {cat.libellé}
    </button>
  ))}
</div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">Trier par:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="popular">Popularité</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chargement...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProduits.map((product) => (
            <Link
              key={product.id}
              to={`${productUrlPrefix}/${product.id}`}
              className="bg-white shadow-md overflow-hidden border-4 border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group hover:border-primary"
            >
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {product.image ? (
                  <img
                    src={getBoutiqueImageUrl(product.image)}
                    alt={product.nom}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {product.statut === "Stock limité" && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-sm font-medium border-2 border-orange-600">
                    Stock limité
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.nom}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(product.prix)}</p>
                    <p className="text-xs text-gray-500">{product.stock} en stock</p>
                  </div>
                  <div className="w-10 h-10 bg-primary border-2 border-primary flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredProduits.length === 0 && (
        <div className="bg-white shadow-md p-12 text-center border-4 border-gray-100">
          <Search className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
}