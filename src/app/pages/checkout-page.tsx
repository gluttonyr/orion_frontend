import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { Check, ShoppingBag, AlertCircle, CreditCard } from "lucide-react";
import { useCart } from "../lib/cart-context";
import { useUser } from "../lib/user-context";
import { venteService } from "../service/vente.service";
import { paiementService } from "../service/paiement.service";

export function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isDashboard = location.pathname.startsWith("/dashboard");
  const homeUrl = isDashboard ? "/dashboard" : "/";
  const marketplaceUrl = isDashboard ? "/dashboard/marketplace" : "/marketplace";

  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useUser();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retour depuis CinetPay : la page est rechargée avec ?transaction_id=...
  const transactionId = searchParams.get("transaction_id");
  const [verifying, setVerifying] = useState(!!transactionId);
  const [paymentStatus, setPaymentStatus] = useState<"SUCCESS" | "FAILED" | null>(null);

  useEffect(() => {
    if (!transactionId) return;

    paiementService
      .check(transactionId)
      .then((result) => {
        const success = result.status === "SUCCESS";
        setPaymentStatus(success ? "SUCCESS" : "FAILED");
        if (success) {
          clearCart();
        }
      })
      .catch(() => setPaymentStatus("FAILED"))
      .finally(() => setVerifying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePay = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setError(null);
    setIsProcessing(true);
    try {
      const { payment_url } = await venteService.initPayment({
        utilisateurId: user.id,
        produitIds: items.map((item) => Number(item.id)),
        quantites: items.map((item) => item.quantity),
        client: {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.contact || "",
        },
        returnPath: isDashboard ? "/dashboard/checkout" : "/checkout",
      });
      window.location.href = payment_url;
    } catch (err) {
      console.error("Erreur lors de l'initialisation du paiement:", err);
      setError("Impossible d'initialiser le paiement. Veuillez réessayer.");
      setIsProcessing(false);
    }
  };

  // Vérification du retour CinetPay en cours
  if (verifying) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Vérification du paiement...</p>
      </div>
    );
  }

  // Paiement confirmé avec succès
  if (paymentStatus === "SUCCESS") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-secondary p-8 text-center">
          <div className="w-20 h-20 bg-secondary border-4 border-secondary mx-auto mb-6 flex items-center justify-center">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Commande confirmée !</h1>
          <p className="text-lg text-gray-600 mb-8">
            Merci pour votre achat. Votre paiement a bien été reçu et votre commande est en cours de préparation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={homeUrl}
              className="px-8 py-3 bg-primary text-white font-medium hover:bg-blue-700 transition-all border-2 border-primary"
            >
              Retour à l'accueil
            </Link>
            <Link
              to={marketplaceUrl}
              className="px-8 py-3 text-primary hover:bg-gray-50 border-2 border-gray-200 hover:border-primary transition-all font-medium"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Paiement échoué ou annulé
  if (paymentStatus === "FAILED") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-red-200 p-8 text-center">
          <div className="w-20 h-20 bg-red-500 border-4 border-red-500 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Paiement échoué</h1>
          <p className="text-gray-600 mb-8">
            Votre paiement n'a pas pu être confirmé. Aucune commande n'a été validée, vous pouvez réessayer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/cart"
              className="px-8 py-3 bg-primary text-white font-medium hover:bg-blue-700 transition-all border-2 border-primary"
            >
              Retour au panier
            </Link>
            <Link
              to={marketplaceUrl}
              className="px-8 py-3 text-primary hover:bg-gray-50 border-2 border-gray-200 hover:border-primary transition-all font-medium"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Panier vide (hors retour de paiement)
  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center py-12">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">Ajoutez des articles avant de passer au paiement</p>
          <Link
            to={marketplaceUrl}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-medium hover:bg-blue-700 transition-all border-2 border-primary"
          >
            Voir le marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paiement</h1>
        <p className="text-gray-600 mt-1">Vérifiez votre commande avant de payer</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-blue-50 border-2 border-blue-200 text-blue-900 px-5 py-4 flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            <Link to="/login" className="font-semibold underline">
              Connectez-vous
            </Link>{" "}
            pour finaliser votre paiement.
          </p>
        </div>
      )}

      <div className="bg-white border-4 border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h2>

        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="w-16 h-16 bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                <p className="text-sm text-gray-600">
                  Vendu par {item.seller} · Qté: {item.quantity}
                </p>
                <p className="text-sm font-semibold text-primary">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

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
            <span className="text-2xl font-bold text-primary">{formatCurrency(getTotalPrice())}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={isProcessing || !isAuthenticated}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-secondary text-white font-semibold hover:bg-green-600 transition-all border-2 border-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin"></div>
              Redirection vers le paiement...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Procéder au paiement
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Vous serez redirigé vers CinetPay pour choisir votre moyen de paiement (Mobile Money, carte bancaire...) et
          finaliser la transaction.
        </p>

        <Link
          to="/cart"
          className="block text-center mt-4 px-6 py-3 text-primary hover:bg-gray-50 border-2 border-gray-200 hover:border-primary transition-all font-medium"
        >
          Retour au panier
        </Link>
      </div>
    </div>
  );
}
