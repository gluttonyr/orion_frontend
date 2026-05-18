import { createContext, useContext, useState, type ReactNode, useEffect,} from "react";
import {TypePlan, type Plan,} from "../model/model";
import planService from "../service/plan.service";

// CONTEXT TYPE
interface SubscriptionContextType {
  subscription: Plan | null;
  getPlanLimits: (plan: TypePlan) => Plan;
  subscribeToPlan: (plan: TypePlan) => void;
  cancelSubscription: () => void;
  canCreateStore: () => boolean;
  canCreateProduct: () => boolean;
}

// CONTEXT
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// DEFAULT LOCAL PLANS
export const planDetails: Plan[] = [
  {
    id: 1,
    titre: "Plan Basique",
    type: TypePlan.BASIQUE,
    prix: 0,
    avantages: "Accès Basique",
    description: "",
    nombreBoutiques: 1,
    nombreProduits: 10,
    dureeEnMois: 1,
    dateActivation: null,
    dateCreation: new Date(),
    dateExpiration: null,
    active: false,
    renouvelement: false,
  },
  {
    id: 2,
    titre: "Plan Professionnel",
    type: TypePlan.PRO,
    prix: 15000,
    avantages: "Pour les experts commerçants",
    description: "",
    nombreBoutiques: 3,
    nombreProduits: 100,
    dureeEnMois: 1,
    dateActivation: null,
    dateCreation: new Date(),
    dateExpiration: null,
    active: false,
    renouvelement: false,
  },
];

// GET PLANS API
const getPlans = async (): Promise<Plan[]> => {
  const planServ = await planService.getAll();

  return planServ.map((p) => ({
    id: p.id,
    titre: p.titre,
    type: p.type,
    prix: p.prix,
    avantages: p.avantages,
    description: p.description,
    nombreBoutiques: p.nombreBoutiques,
    nombreProduits: p.nombreProduits,
    dureeEnMois: p.dureeEnMois,
    dateActivation: p.dateActivation,
    dateCreation: p.dateCreation,
    dateExpiration: p.dateExpiration,
    active: p.active,
    renouvelement: p.renouvelement,
    commercant: p.commercant,
  }));
};

// PROVIDER
export function SubscriptionProvider({children,}: {children: ReactNode;}) {
  // ALL PLANS
  const [plans, setPlans] = useState<Plan[]>([]);

  // LOAD PLANS
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await getPlans();
        setPlans(data);
      } catch (error) { console.error("Erreur chargement plans :", error);}
    };

    loadPlans();
  }, []);

  // SUBSCRIPTION
  const [subscription, setSubscription] = useState<Plan | null>(() => {
      const saved = localStorage.getItem("orion-subscription");

      if (saved) {
        const parsed = JSON.parse(saved);

        return {
          ...parsed,
          dateActivation:
            parsed.dateActivation
              ? new Date(parsed.dateActivation)
              : null,
          dateExpiration:
            parsed.dateExpiration
              ? new Date(parsed.dateExpiration)
              : null,
        };
      }

      // default plan
      return {
        ...planDetails[0],
        dateActivation: new Date(),
        dateExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        active: true,
        renouvelement: true,
      };
    });

  // SAVE LOCAL STORAGE
  useEffect(() => { if (subscription) { localStorage.setItem("orion-subscription", JSON.stringify(subscription));}}, [subscription]);

  // UPDATE API
  useEffect(() => {
    if (!subscription) return;

    const updateSubscription =
      async () => {
        if (!subscription.id) return;
        try { await planService.update(subscription.id, subscription);
        } catch (error) { console.error("Erreur update abonnement :", error);}
      };

    updateSubscription();
  }, [subscription]);

  // GET PLAN
  const getPlanLimits = (plan: TypePlan): Plan => {
    const selectedPlan =
      plans.find((item) => item.type === plan) ||
      planDetails.find((item) => item.type === plan);

    if (!selectedPlan) { throw new Error(`Plan introuvable : ${plan}`);}

    return selectedPlan;
  };

  // SUBSCRIBE
  const subscribeToPlan = (plan: TypePlan) => {
    const selectedPlan = getPlanLimits(plan);

    if (!selectedPlan) return;
    const duration = selectedPlan.dureeEnMois;

    const newSubscription: Plan =
      {
        ...selectedPlan,
        dateActivation: new Date(),
        dateExpiration: new Date(Date.now() + Number(duration) * 30 * 24 * 60 * 60 * 1000),
        active: true,
        renouvelement: true,
      };

    setSubscription(newSubscription);
  };

  // CANCEL
  const cancelSubscription = () => {
    if (!subscription) return;

    setSubscription({...subscription, active: false, renouvelement: false,});
  };

  // CHECKS
  const canCreateStore = (): boolean => { return !!subscription?.active;};
  const canCreateProduct = (): boolean => { return !!subscription?.active;};

  // PROVIDER
  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        getPlanLimits,
        subscribeToPlan,
        cancelSubscription,
        canCreateStore,
        canCreateProduct,
      }}>{children}
    </SubscriptionContext.Provider>
  );
}

// HOOK
export function useSubscription() {
  const context =
    useContext(SubscriptionContext);

  if (!context) { throw new Error("useSubscription doit être utilisé dans un SubscriptionProvider");}

  return context;
}