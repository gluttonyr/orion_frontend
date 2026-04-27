import { useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router";
import { ArrowLeft, Star, ShoppingCart, Package, MapPin, Phone, Mail, Heart } from "lucide-react";
import { products, merchants } from "../lib/mock-data";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Déterminer si on est dans le dashboard ou la marketplace publique
  const isDashboard = location.pathname.startsWith("/dashboard");
  const marketplaceUrl = isDashboard ? "/dashboard/marketplace" : "/";
  const checkoutUrl = isDashboard ? "/dashboard/checkout" : "/login";
  const messagesUrl = isDashboard ? "/dashboard/messages" : "/login";

  const product = products.find((p) => p.id === id);
  const merchant = product ? merchants.find((m) => m.id === product.merchantId) : null;

  if (!product || !merchant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Produit non trouvé</h2>
        <Link to={marketplaceUrl} className="text-primary hover:text-blue-700 mt-4 inline-block">
          Retour au marketplace
        </Link>
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

  const handleAddToCart = () => {
    navigate(checkoutUrl);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Back Button */}
      <Link
        to={marketplaceUrl}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Retour au marketplace</span>
      </Link>

      {/* Product Detail Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images Section */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="aspect-square bg-gray-100">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? "border-primary shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-blue-100 text-primary rounded-full text-sm font-medium mb-3">
                  {product.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
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
                  <span className="text-gray-600">({product.rating})</span>
                </div>
              </div>
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Price and Availability */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</p>
                  <p className="text-sm text-gray-500 mt-1">Prix unitaire</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                    product.availability === "En stock"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    <Package className="w-4 h-4" />
                    <span className="font-medium">{product.availability}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{product.stock} unités disponibles</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    +
                  </button>
                  <div className="ml-auto">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(product.price * quantity)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  Ajouter au panier
                </button>
                <button
                  onClick={handleAddToCart}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-md"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Acheter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Merchant Info */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-md p-6 border border-blue-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations sur le commerçant</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
                {merchant.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{merchant.name}</h3>
                <p className="text-gray-600">{merchant.shopName}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-900">{merchant.rating}</span>
                  <span className="text-gray-500 text-sm">({merchant.totalSales} ventes)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-blue-200 pt-4">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">{merchant.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm">Spécialités: {merchant.specialties.join(", ")}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-50 transition-colors font-medium border border-primary">
                <Phone className="w-4 h-4 inline mr-2" />
                Appeler
              </button>
              <Link
                to={messagesUrl}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Contacter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}