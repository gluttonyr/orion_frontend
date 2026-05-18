import { useNavigate } from "react-router";
import { Check, Crown, Zap, Rocket, KeyIcon  } from "lucide-react";
import { useSubscription, planDetails } from "../lib/subscription-context";
import { TypePlan } from "../model/model";
import { userService } from "../service/utilisateur.service";
import { useEffect, useState } from "react";

export function Subscriptions() {
  const navigate = useNavigate();
  const { subscription } = useSubscription();
  const token = localStorage.getItem("token")
  const userCurrent = async () => { return token ? userService.getCurrent(token) : null;}
  const [user, setUser] = useState<any>();

  useEffect(() => {
      setUser(userCurrent)
    }, []);

  

  const formatCurrency = (amount: number) => { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0, }).format(amount); };
  const handleSubscribe = (plan: TypePlan) => { navigate(`/dashboard/subscriptions/checkout/${plan}`);};

  const getPlanIcon = (plan: TypePlan) => {
    switch (plan) {
      case TypePlan.BASIQUE: return <Zap className="w-8 h-8" />;
      case TypePlan.PRO: return <Crown className="w-8 h-8" />;
      case TypePlan.BUSINESS: return <Rocket className="w-8 h-8" />;
      default: return <KeyIcon className="w-8 h-8" />;
    }
  };

  const getPlanColor = (plan: TypePlan) => {
    switch (plan) {
      case TypePlan.BASIQUE: return "from-blue-500 to-blue-600";
      case TypePlan.PRO: return "from-purple-500 to-purple-600";
      case TypePlan.BUSINESS: return "from-orange-500 to-orange-600";
      default: return "from-orange-500 to-amber-600";
    }
  };

  const isCurrentPlan = (plan: TypePlan) => { return subscription?.type === plan && subscription?.active;};

  return (
    <div className="pb-20 md:pb-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Choisissez votre abonnement</h1>
        <p className="text-gray-600 text-lg">Sélectionnez le plan qui correspond le mieux à vos besoins</p>
      </div>

      {/* Current Subscription Banner */}
      {subscription && subscription.active && (
        <div className="bg-gradient-to-r from-secondary to-green-600 border-4 border-secondary p-6 mb-8">
          <div className="flex items-center gap-3 text-white">
            {subscription.type &&
            <div className="w-12 h-12 bg-white/20 border-2 border-white/40 flex items-center justify-center">
              {getPlanIcon(subscription.type)}
            </div>
            }
            <div>
              <p className="text-sm opacity-90">Abonnement actuel</p>
              {subscription.type && <p className="font-bold text-xl">{subscription.titre}</p>}
              {subscription.dateExpiration && 
              <p className="text-xs opacity-80">
                Expire le {new Date(subscription.dateExpiration).toLocaleDateString("fr-FR")}
                {subscription.renouvelement && " • Renouvellement automatique"}
              </p>
              }
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {(Object.keys(planDetails) as TypePlan[]).map((planKey: any) => {
          const plan = planDetails[planKey];
          const isCurrent = isCurrentPlan(planKey);

          return (
            <div
              key={planKey}
              className={`bg-white border-4 transition-all ${
                isCurrent
                  ? "border-secondary shadow-xl scale-105"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
              }`}>
              {/* Header */}
              <div className={`bg-gradient-to-r ${getPlanColor(planKey)} p-6 text-white`}>
                <div className="w-14 h-14 bg-white/20 border-2 border-white/40 flex items-center justify-center mb-4">
                  {getPlanIcon(planKey)}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.titre}</h3>
                <div className="flex items-baseline gap-1">
                  {plan.prix && <span className="text-4xl font-bold">{formatCurrency(plan.prix)}</span>}
                  <span className="text-white/80 text-sm">/mois</span>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                {plan.avantages &&
                  <div className="w-full">
                    <div className="w-5 h-5 bg-secondary border-2 border-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm">{plan.avantages}</span>
                  </div>
                }

                {/* Action Button */}
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-gray-100 text-gray-500 font-medium border-2 border-gray-200 cursor-not-allowed"
                  >Plan actuel
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(planKey)}
                    className={`w-full px-6 py-3 bg-gradient-to-r ${getPlanColor(planKey
                    )} text-white font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg border-2 border-transparent active:scale-95`}
                  >{subscription && subscription.active ? "Changer de plan" : "S'abonner"}
                  </button>
                )}
              </div>
              {user &&
              <div className="border border-green-700 bg-green-300 rounded">{user.nom + " " + user.prenom}</div>
              }
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-12 bg-blue-50 border-4 border-blue-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-lg">Questions fréquentes</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-gray-900 mb-1">Puis-je changer de plan à tout moment ?</p>
            <p className="text-gray-700">
              Oui, vous pouvez upgrader ou downgrader votre plan à tout moment.
              Les changements prennent effet immédiatement.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">Que se passe-t-il si j'annule mon abonnement ?</p>
            <p className="text-gray-700">
              Votre accès reste actif jusqu'à la fin de la période payée. Après,
              vous passerez automatiquement au plan Basique gratuit.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">Les paiements sont-ils sécurisés ?</p>
            <p className="text-gray-700">
              Tous les paiements sont sécurisés et cryptés. Nous acceptons
              Mobile Money, Orange Money et les cartes bancaires.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}