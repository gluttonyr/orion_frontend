import { Link } from "react-router";
import { CheckCircle, ArrowRight, Download } from "lucide-react";
import { useSubscription, planDetails } from "../lib/subscription-context";

export function SubscriptionSuccess() {
  const { subscription } = useSubscription();

  if (!subscription) {
    return null;
  }

  const plan = planDetails[subscription.plan];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto text-center pb-20 md:pb-6">
      {/* Success Icon */}
      <div className="mb-6">
        <div className="w-20 h-20 bg-secondary border-4 border-secondary mx-auto flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Paiement réussi !
        </h1>
        <p className="text-gray-600 text-lg">
          Votre abonnement a été activé avec succès
        </p>
      </div>

      {/* Subscription Details */}
      <div className="bg-white border-4 border-gray-200 p-8 mb-6">
        <div className="flex items-center justify-center gap-3 mb-6 pb-6 border-b-4 border-gray-100">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary border-2 border-secondary flex items-center justify-center">
            <span className="text-white font-bold">O</span>
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-600">Orion - Abonnement {plan.name}</p>
            <p className="font-bold text-gray-900">
              {formatCurrency(plan.price)} / mois
            </p>
          </div>
        </div>

        <div className="space-y-3 text-left">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Date d'activation</span>
            <span className="font-medium text-gray-900">
              {new Date(subscription.startDate).toLocaleDateString("fr-FR")}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Prochain paiement</span>
            <span className="font-medium text-gray-900">
              {new Date(subscription.endDate).toLocaleDateString("fr-FR")}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Renouvellement automatique</span>
            <span className="font-medium text-gray-900">
              {subscription.autoRenew ? "Activé" : "Désactivé"}
            </span>
          </div>
        </div>

        <button className="w-full mt-6 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary font-medium transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Télécharger le reçu
        </button>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border-4 border-blue-200 p-6 mb-8 text-left">
        <h3 className="font-bold text-gray-900 mb-4 text-lg">Prochaines étapes</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary border-2 border-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">
                Créez vos boutiques
              </p>
              <p className="text-sm text-gray-700">
                Vous pouvez maintenant créer jusqu'à {plan.maxStores === 999 ? "un nombre illimité de" : plan.maxStores} boutique{plan.maxStores > 1 ? "s" : ""}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary border-2 border-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">
                Ajoutez vos produits
              </p>
              <p className="text-sm text-gray-700">
                Gérez jusqu'à {plan.maxProducts === 99999 ? "un nombre illimité de" : plan.maxProducts} produit{plan.maxProducts > 1 ? "s" : ""} sur la marketplace
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary border-2 border-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">
                Explorez les fonctionnalités
              </p>
              <p className="text-sm text-gray-700">
                Découvrez toutes les fonctionnalités premium de votre nouveau plan
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/dashboard"
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-blue-700 text-white font-medium transition-all shadow-md hover:shadow-lg border-2 border-primary"
        >
          Aller au tableau de bord
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          to="/dashboard/stores"
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary font-medium transition-all"
        >
          Gérer mes boutiques
        </Link>
      </div>
    </div>
  );
}
