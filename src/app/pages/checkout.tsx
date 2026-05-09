import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CreditCard, Wallet, Smartphone, Shield, Check } from "lucide-react";
import { useCart } from "../lib/cart-context";

export function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState("mobile");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const { items: cartItems } = useCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 3000;
  const total = subtotal + delivery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Commande passée avec succès ! 🎉");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Back Button */}
      <Link
        to="/app/marketplace"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Retour</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paiement sécurisé</h1>
        <p className="text-gray-600 mt-1">Finalisez votre commande</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de livraison</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemple@email.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+221 XX XXX XX XX"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse de livraison *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Adresse complète"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  required
                />
              </div>
            </form>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Méthode de paiement</h2>
            
            <div className="space-y-3">
              {/* Mobile Money */}
              <button
                type="button"
                onClick={() => setPaymentMethod("mobile")}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  paymentMethod === "mobile"
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentMethod === "mobile" ? "bg-primary" : "bg-gray-100"
                  }`}>
                    <Smartphone className={`w-5 h-5 ${
                      paymentMethod === "mobile" ? "text-white" : "text-gray-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Mobile Money</p>
                    <p className="text-sm text-gray-600">Orange Money, MTN, Moov...</p>
                  </div>
                  {paymentMethod === "mobile" && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>

              {/* Bank Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  paymentMethod === "card"
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentMethod === "card" ? "bg-primary" : "bg-gray-100"
                  }`}>
                    <CreditCard className={`w-5 h-5 ${
                      paymentMethod === "card" ? "text-white" : "text-gray-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Carte bancaire</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard</p>
                  </div>
                  {paymentMethod === "card" && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  paymentMethod === "cash"
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentMethod === "cash" ? "bg-primary" : "bg-gray-100"
                  }`}>
                    <Wallet className={`w-5 h-5 ${
                      paymentMethod === "cash" ? "text-white" : "text-gray-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Paiement à la livraison</p>
                    <p className="text-sm text-gray-600">Espèces uniquement</p>
                  </div>
                  {paymentMethod === "cash" && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Cart Items */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Résumé de la commande</h2>
            
            <div className="space-y-4 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Livraison</span>
                <span>{formatCurrency(delivery)}</span>
              </div>
              <div className="flex items-center justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Paiement 100% sécurisé</h4>
                <p className="text-sm text-gray-600">
                  Vos données sont protégées et cryptées. Nous ne stockons jamais vos informations bancaires.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            Confirmer la commande - {formatCurrency(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
