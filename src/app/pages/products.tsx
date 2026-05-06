import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Search, Edit, Trash2, Package, TrendingUp, AlertCircle, Eye, Store as StoreIcon } from "lucide-react";

import type { produits } from "../model/model";
import { useStore } from "../lib/store-context";
import { produitService } from "../service/produit.service";
import { useImage } from "../lib/image-context";

export function Products() {
  const navigate = useNavigate();
  const { activeStore } = useStore();

  const [produitsList, setProduitsList] = useState<produits[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const { getBoutiqueImageUrl } = useImage();

  // Chargement des produits depuis le backend
  useEffect(() => {
    const fetchProduits = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await produitService.getAll();
        setProduitsList(data);
      } catch (err) {
        console.error("Erreur lors du chargement des produits:", err);
        setError("Impossible de charger les produits. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();
  }, []);

  // Filtrer les produits par recherche
  const filteredProduits = produitsList.filter((product) =>
    product.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Statistiques
  const totalProducts = filteredProduits.length;
  const totalValue = filteredProduits.reduce((sum, p) => sum + p.prix * p.stock, 0);
  const lowStock = filteredProduits.filter((p) => p.stock < 10).length;

  const handleDelete = (id: number) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (productToDelete === null) return;
    try {
      await produitService.delete(productToDelete);
      setProduitsList((prev) => prev.filter((p) => p.id !== productToDelete));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Impossible de supprimer le produit. Veuillez réessayer.");
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Produits</h1>
          <p className="text-gray-600 mt-1">Gérez votre catalogue de produits</p>
          {activeStore && (
            <div className="flex items-center gap-2 mt-2 text-sm">
              <StoreIcon className="w-4 h-4 text-primary" />
              <span className="text-gray-600">
                Boutique: <span className="font-medium text-gray-900">{activeStore.name}</span>
              </span>
            </div>
          )}
        </div>
        <Link
          to="/dashboard/products/add"
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white hover:bg-blue-700 transition-colors font-medium shadow-md border-2 border-primary"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un produit</span>
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm font-medium mb-1">Total Produits</p>
              <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0 ml-4">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm font-medium mb-1">Valeur Stock</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 border-2 border-green-200 flex items-center justify-center flex-shrink-0 ml-4">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md p-6 border-4 border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm font-medium mb-1">Stock Faible</p>
              <p className="text-3xl font-bold text-gray-900">{lowStock}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 border-2 border-orange-200 flex items-center justify-center flex-shrink-0 ml-4">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow-md p-5 md:p-6 border-4 border-gray-100">
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
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-md border-4 border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Chargement des produits...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-4 border-gray-200">
                <tr>
                  <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[250px]">
                    Produit
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[120px]">
                    Prix
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[100px]">
                    Stock
                  </th>
                  <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[120px]">
                    Statut
                  </th>
                  <th className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-gray-900 min-w-[140px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {filteredProduits.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {product.image ? (
                          <img
                            src={getBoutiqueImageUrl(product.image)}
                            alt={product.nom}
                            className="w-14 h-14 border-2 border-gray-200 object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 border-2 border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 break-words line-clamp-2">
                            {product.nom}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-1 break-words">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <p className="font-semibold text-gray-900 whitespace-nowrap">
                        {formatCurrency(product.price)}
                      </p>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <p
                        className={`font-medium whitespace-nowrap ${
                          product.stock < 10 ? "text-orange-600" : "text-gray-900"
                        }`}
                      >
                        {product.stock} unités
                      </p>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium border-2 whitespace-nowrap ${
                          product.statut === "En stock"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : product.statut === "Stock limité"
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {product.statut}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/products/${product.id}`)}
                          className="p-2 text-gray-600 hover:text-primary hover:bg-blue-50 transition-colors border-2 border-transparent hover:border-blue-200"
                          title="Voir les détails"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}
                          className="p-2 text-gray-600 hover:text-primary hover:bg-blue-50 transition-colors border-2 border-transparent hover:border-blue-200"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors border-2 border-transparent hover:border-red-200"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredProduits.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 border-4 border-gray-200 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600 mb-4">Commencez par ajouter votre premier produit</p>
            <Link
              to="/dashboard/products/add"
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white hover:bg-blue-700 transition-colors font-medium border-2 border-primary"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter un produit</span>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-6 md:p-8 shadow-xl border-4 border-red-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 text-white hover:bg-red-600 transition-colors font-medium border-2 border-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}