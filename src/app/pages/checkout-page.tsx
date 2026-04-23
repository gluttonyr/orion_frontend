import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { CreditCard, Smartphone, Building, Check, ShoppingBag, AlertCircle } from "lucide-react";
import { useCart } from "../lib/cart-context";
import { useUser } from "../lib/user-context";
import panierService from "../service/panier.service";

export function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("mobile");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Sénégal",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Sauvegarder le panier au backend
      await panierService.create({
        utilisateurId: user?.id || 1, // utiliser l'utilisateur connecté
        produitId: items.map(item => parseInt(item.id)),
        quantites: items.map(item => item.quantity),
        statut: 'en_cours'
      });

      // Simuler le paiement et finaliser
      setTimeout(() => {
        setIsProcessing(false);
        setOrderComplete(true);
        clearCart();
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      setIsProcessing(false);
      // TODO: afficher une erreur
    }
  };

  // Rediriger si le panier est vide
  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center py-12">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">Ajoutez des articles avant de passer au paiement</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-medium hover:bg-blue-700 transition-all border-2 border-primary"
          >
            Voir le marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Page de confirmation de commande
  if (orderComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-secondary p-8 text-center">
          <div className="w-20 h-20 bg-secondary border-4 border-secondary mx-auto mb-6 flex items-center justify-center">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Commande confirmée !</h1>
          <p className="text-lg text-gray-600 mb-2">
            Merci pour votre achat. Votre commande a été confirmée.
          </p>
          <p className="text-gray-600 mb-8">
            Numéro de commande: <span className="font-semibold text-primary">ORD-{Date.now()}</span>
          </p>

          <div className="bg-blue-50 border-4 border-blue-200 p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Prochaines étapes</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>Un email de confirmation a été envoyé à {formData.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>Le vendeur préparera votre commande dans les prochaines 24h</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>Vous recevrez un SMS lorsque votre colis sera expédié</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-primary text-white font-medium hover:bg-blue-700 transition-all border-2 border-primary"
            >
              Retour à l'accueil
            </Link>
            <Link
              to="/marketplace"
              className="px-8 py-3 text-primary hover:bg-gray-50 border-2 border-gray-200 hover:border-primary transition-all font-medium"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paiement</h1>
        <p className="text-gray-600 mt-1">Complétez votre commande</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de livraison */}
            <div className="bg-white border-4 border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de livraison</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Amadou Diallo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="amadou@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+221 77 123 45 67"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse de livraison *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Rue 10, Quartier Almadies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Dakar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    title="Sélectionnez votre pays"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="Sénégal">Sénégal</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    <option value="Mali">Mali</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Bénin">Bénin</option>
                    <option value="Togo">Togo</option>
                    <option value="Niger">Niger</option>
                    <option value="Guinée">Guinée</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Méthode de paiement */}
            <div className="bg-white border-4 border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Méthode de paiement</h2>

              <div className="space-y-3">
                {/* Mobile Money */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mobile")}
                  className={`w-full flex items-center gap-4 p-4 border-2 transition-all ${
                    paymentMethod === "mobile"
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === "mobile"
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "mobile" && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <Smartphone className="w-6 h-6 text-gray-600" />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Mobile Money</p>
                    <p className="text-sm text-gray-600">Orange Money, Wave, Free Money</p>
                  </div>
                </button>

                {/* Carte bancaire */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center gap-4 p-4 border-2 transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "card" && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <CreditCard className="w-6 h-6 text-gray-600" />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Carte bancaire</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard</p>
                  </div>
                </button>

                {/* Virement bancaire */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className={`w-full flex items-center gap-4 p-4 border-2 transition-all ${
                    paymentMethod === "bank"
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === "bank"
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMethod === "bank" && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <Building className="w-6 h-6 text-gray-600" />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Virement bancaire</p>
                    <p className="text-sm text-gray-600">Transfert direct</p>
                  </div>
                </button>
              </div>

              {/* Info sur le paiement */}
              <div className="mt-6 bg-blue-50 border-2 border-blue-200 p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Paiement sécurisé</p>
                  <p>Vos informations de paiement sont cryptées et sécurisées.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-4 border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-600">Qté: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t-2 border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-medium">{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="font-medium text-secondary">Gratuite</span>
                </div>
                <div className="flex justify-between border-t-2 border-gray-200 pt-3">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-secondary text-white font-semibold hover:bg-green-600 transition-all border-2 border-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin"></div>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Confirmer le paiement
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="block text-center mt-4 px-6 py-3 text-primary hover:bg-gray-50 border-2 border-gray-200 hover:border-primary transition-all font-medium"
              >
                Retour au panier
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
