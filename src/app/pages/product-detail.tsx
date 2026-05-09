import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router";
import { ArrowLeft, ShoppingCart, Package, Heart, AlertCircle } from "lucide-react";
import { produitService } from "../service/produit.service";
import { useImage } from "../lib/image-context";
import type { produits } from "../model/model";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getBoutiqueImageUrl } = useImage();

  const [product, setProduct] = useState<produits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const isDashboard = location.pathname.startsWith("/dashboard");
  const marketplaceUrl = isDashboard ? "/dashboard/marketplace" : "/";
  const checkoutUrl = isDashboard ? "/dashboard/checkout" : "/login";

  useEffect(() => {
    if (!id) return;
    const fetchProduit = async () => {
      try {
        setLoading(true);
        setError(null);
        // Utilisez getById si disponible, sinon getAll + find
        const data = await produitService.getById(Number(id));
        setProduct(data);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Produit introuvable.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduit();
  }, [id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(amount);

  if (loading) return (
    <div className="text-center py-16">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-500">Chargement du produit...</p>
    </div>
  );

  if (error || !product) return (
    <div className="text-center py-12">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Produit non trouvé</h2>
      <Link to={marketplaceUrl} className="text-primary hover:text-blue-700">Retour au marketplace</Link>
    </div>
  );

  const images = product.image ? [getBoutiqueImageUrl(product.image)] : [];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <Link to={marketplaceUrl} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5" />
        <span>Retour au marketplace</span>
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-white shadow-md overflow-hidden border-4 border-gray-100">
          <div className="aspect-square bg-gray-100">
            {images.length > 0 ? (
              <img src={images[0]} alt={product.nom} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-300" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="bg-white shadow-md p-6 border-4 border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{product.nom}</h1>
              <button title="heart" className="w-10 h-10 bg-gray-100 flex items-center justify-center hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(product.prix)}</p>
                  <p className="text-sm text-gray-500 mt-1">Prix unitaire</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 border-2 text-sm font-medium ${
                    product.statut === "En stock"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-orange-100 text-orange-700 border-orange-200"
                  }`}>
                    <Package className="w-4 h-4" />
                    {product.statut}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{product.stock} unités disponibles</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
                  >-</button>
                  <input
                    type="number"
                    title="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center py-2 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
                  >+</button>
                  <div className="ml-auto">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(product.prix * quantity)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="px-6 py-3 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors font-medium border-2 border-gray-200">
                  Ajouter au panier
                </button>
                <button
                  title="checkout"
                  onClick={() => navigate(checkoutUrl)}
                  className="px-6 py-3 bg-primary text-white hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-md border-2 border-primary">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Acheter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white shadow-md p-6 border-4 border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">{product.description || "Aucune description disponible."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}