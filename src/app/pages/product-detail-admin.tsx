import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Edit, Trash2, Package, DollarSign, TrendingUp, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { products } from "../lib/mock-data";

export function ProductDetailAdmin() {
  const navigate = useNavigate();
  const { id } = useParams();
  const product = products.find(p => p.id === id);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h2>
        <button
          onClick={() => navigate("/dashboard/products")}
          className="mt-4 px-6 py-3 bg-primary text-white hover:bg-blue-700 transition-colors border-2 border-primary"
        >
          Retour aux produits
        </button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleDelete = () => {
    // Simuler la suppression
    console.log("Produit supprimé:", product.id);
    navigate("/dashboard/products");
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/products")}
            className="p-2 text-gray-600 hover:text-primary transition-colors border-2 border-gray-200 hover:border-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
              {product.name}
            </h1>
            <p className="text-gray-600 mt-1">Détails du produit</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/dashboard/products/edit/${product.id}`)}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-white hover:bg-blue-700 transition-colors font-medium shadow-md border-2 border-primary"
          >
            <Edit className="w-5 h-5" />
            <span className="hidden sm:inline">Modifier</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white hover:bg-red-600 transition-colors font-medium shadow-md border-2 border-red-600"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden sm:inline">Supprimer</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
          <div className="relative mb-4">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-64 md:h-96 object-cover border-4 border-gray-200"
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-800 border-2 border-gray-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-gray-800 border-2 border-gray-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`border-4 ${
                    currentImageIndex === index
                      ? "border-primary"
                      : "border-gray-200 hover:border-gray-300"
                  } transition-colors`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Price & Stock Card */}
          <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Prix unitaire</p>
                <p className="text-3xl font-bold text-primary break-words">
                  {formatCurrency(product.price)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Stock disponible</p>
                <p className={`text-3xl font-bold ${product.stock < 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                  {product.stock} <span className="text-lg">unités</span>
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t-2 border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Statut:</span>
                <span className={`px-4 py-2 font-medium border-2 ${
                  product.availability === "En stock"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-orange-100 text-orange-700 border-orange-200"
                }`}>
                  {product.availability}
                </span>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white shadow-md p-6 md:p-8 border-4 border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium">Catégorie</p>
                <span className="inline-block px-4 py-2 bg-blue-100 text-primary font-medium border-2 border-blue-200">
                  {product.category}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Description</p>
                <p className="text-gray-700 leading-relaxed break-words">
                  {product.description}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium">Note du produit</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-700 font-medium">
                    {product.rating.toFixed(1)} / 5
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 shadow-md p-6 md:p-8 border-4 border-blue-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <p className="text-sm text-gray-600 font-medium">Valeur totale</p>
                </div>
                <p className="text-xl font-bold text-gray-900 break-words">
                  {formatCurrency(product.price * product.stock)}
                </p>
              </div>

              <div className="bg-white p-4 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  <p className="text-sm text-gray-600 font-medium">Ventes</p>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  0 <span className="text-sm font-normal text-gray-600">ce mois</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-6 md:p-8 shadow-xl border-4 border-red-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6 break-words">
              Êtes-vous sûr de vouloir supprimer <span className="font-semibold">{product.name}</span> ? 
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-500 text-white hover:bg-red-600 transition-colors font-medium border-2 border-red-600"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
