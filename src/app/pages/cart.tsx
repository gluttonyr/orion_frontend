import { Link, useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../lib/cart-context";

export function Cart() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center py-12">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">Découvrez nos produits et commencez vos achats !</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-medium hover:bg-blue-700 transition-all border-2 border-primary"
          >
            Voir le marketplace
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mon Panier</h1>
        <p className="text-gray-600 mt-1">{items.length} article{items.length > 1 ? "s" : ""} dans votre panier</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border-4 border-gray-200 p-4 sm:p-6 hover:border-primary transition-colors"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 border-2 border-gray-200 flex-shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">Vendu par: {item.seller}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 p-2 border-2 border-transparent hover:border-red-200 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-100 border-2 border-gray-200 hover:border-primary hover:bg-gray-200 transition-all flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-100 border-2 border-gray-200 hover:border-primary hover:bg-gray-200 transition-all flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Clear Cart Button */}
          <button
            onClick={clearCart}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border-2 border-red-200 hover:border-red-300 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Vider le panier
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border-4 border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span className="font-medium">{formatCurrency(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="font-medium text-secondary">Gratuite</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-secondary text-white font-semibold hover:bg-green-600 transition-all border-2 border-secondary mb-4"
            >
              Passer au paiement
              <ArrowRight className="w-5 h-5" />
            </button>

            <Link
              to="/marketplace"
              className="block text-center px-6 py-3 text-primary hover:bg-gray-50 border-2 border-gray-200 hover:border-primary transition-all font-medium"
            >
              Continuer mes achats
            </Link>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Paiement 100% sécurisé</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Livraison gratuite</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Garantie satisfait ou remboursé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
