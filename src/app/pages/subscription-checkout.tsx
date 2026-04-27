import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  CreditCard,
  Smartphone,
  CheckCircle,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { useSubscription, planDetails } from "../lib/subscription-context";
import type { SubscriptionPlan } from "../lib/subscription-context";
import { useNotifications } from "../lib/notification-context";

export function SubscriptionCheckout() {
  const navigate = useNavigate();
  const { plan } = useParams<{ plan: SubscriptionPlan }>();
  const { subscribeToPlan, subscription } = useSubscription();
  const { addNotification } = useNotifications();
  const [paymentMethod, setPaymentMethod] = useState<
    "mobile-money" | "orange-money" | "card"
  >("mobile-money");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!plan || !(plan in planDetails)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Plan invalide
        </h2>
        <Link
          to="/dashboard/subscriptions"
          className="text-primary hover:underline"
        >
          Retour aux abonnements
        </Link>
      </div>
    );
  }

  const selectedPlan = planDetails[plan];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simuler le traitement du paiement
    await new Promise((resolve) => setTimeout(resolve, 2000));

    subscribeToPlan(plan);
    addNotification({
      type: "success",
      title: "Abonnement activé",
      message: `Vous êtes maintenant abonné au plan ${selectedPlan.name}`,
      link: "/dashboard",
    });

    setIsProcessing(false);
    navigate("/dashboard/subscriptions/success");
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/dashboard/subscriptions"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux abonnements
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Finaliser votre abonnement
        </h1>
        <p className="text-gray-600">Complétez votre paiement pour activer votre plan</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="md:col-span-2">
          <div className="bg-white border-4 border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Méthode de paiement
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mobile-money")}
                  className={`w-full p-4 border-2 flex items-center gap-3 transition-all ${
                    paymentMethod === "mobile-money"
                      ? "border-primary bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-primary" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Mobile Money</p>
                    <p className="text-sm text-gray-600">
                      MTN, Moov, Wave, etc.
                    </p>
                  </div>
                  {paymentMethod === "mobile-money" && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("orange-money")}
                  className={`w-full p-4 border-2 flex items-center gap-3 transition-all ${
                    paymentMethod === "orange-money"
                      ? "border-primary bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-orange-600" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">Orange Money</p>
                    <p className="text-sm text-gray-600">
                      Paiement Orange Money
                    </p>
                  </div>
                  {paymentMethod === "orange-money" && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full p-4 border-2 flex items-center gap-3 transition-all ${
                    paymentMethod === "card"
                      ? "border-primary bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-primary" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">
                      Carte bancaire
                    </p>
                    <p className="text-sm text-gray-600">Visa, Mastercard</p>
                  </div>
                  {paymentMethod === "card" && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </button>
              </div>

              {/* Payment Details */}
              {(paymentMethod === "mobile-money" ||
                paymentMethod === "orange-money") && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+221 XX XXX XX XX"
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Date d'expiration
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        required
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        className="w-full px-4 py-3 border-2 border-gray-300 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full px-6 py-4 bg-primary hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-lg border-2 border-primary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? "Traitement en cours..."
                  : `Payer ${formatCurrency(selectedPlan.price)}`}
              </button>

              {/* Security Notice */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 border-2 border-gray-200">
                <Shield className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Paiement 100% sécurisé</p>
                  <p className="text-xs text-gray-600">
                    Vos informations de paiement sont cryptées et sécurisées.
                    Nous ne stockons jamais vos données bancaires.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white border-4 border-gray-200 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium text-gray-900">
                  {selectedPlan.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Période</span>
                <span className="font-medium text-gray-900">1 mois</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(selectedPlan.price)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 p-4 text-sm">
              <p className="font-medium text-blue-900 mb-2">Ce qui est inclus :</p>
              <ul className="space-y-1 text-blue-800">
                {selectedPlan.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
                {selectedPlan.features.length > 3 && (
                  <li className="text-blue-600 font-medium">
                    +{selectedPlan.features.length - 3} autres avantages
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
