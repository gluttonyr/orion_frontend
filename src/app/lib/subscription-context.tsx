import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type SubscriptionPlan = "basique" | "pro" | "business";

export interface Subscription {
  plan: SubscriptionPlan;
  startDate: Date;
  endDate: Date;
  active: boolean;
  autoRenew: boolean;
}

export interface PlanLimits {
  maxStores: number;
  maxProducts: number;
  features: string[];
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  getPlanLimits: (plan: SubscriptionPlan) => PlanLimits;
  subscribeToPlan: (plan: SubscriptionPlan) => void;
  cancelSubscription: () => void;
  canCreateStore: () => boolean;
  canCreateProduct: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Plans et leurs limites
export const planDetails: Record<SubscriptionPlan, PlanLimits & { price: number; name: string }> = {
  basique: {
    name: "Basique",
    price: 5000,
    maxStores: 1,
    maxProducts: 50,
    features: [
      "1 boutique",
      "Jusqu'à 50 produits",
      "Marketplace accès",
      "Analyses de base",
      "Support par email",
    ],
  },
  pro: {
    name: "Pro",
    price: 15000,
    maxStores: 3,
    maxProducts: 500,
    features: [
      "3 boutiques",
      "Jusqu'à 500 produits",
      "Marketplace prioritaire",
      "Analyses avancées",
      "Gestion des opportunités",
      "Support prioritaire",
      "Promotion de produits",
    ],
  },
  business: {
    name: "Business",
    price: 35000,
    maxStores: 999,
    maxProducts: 99999,
    features: [
      "Boutiques illimitées",
      "Produits illimités",
      "Marketplace premium",
      "Analyses complètes",
      "API personnalisée",
      "Multi-utilisateurs",
      "Support 24/7",
      "Gestionnaire de compte dédié",
    ],
  },
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(() => {
    const saved = localStorage.getItem("orion-subscription");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
      };
    }
    // Abonnement basique par défaut pour la démo
    return {
      plan: "basique",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      active: true,
      autoRenew: true,
    };
  });

  useEffect(() => {
    if (subscription) {
      localStorage.setItem("orion-subscription", JSON.stringify(subscription));
    }
  }, [subscription]);

  const getPlanLimits = (plan: SubscriptionPlan): PlanLimits => {
    return {
      maxStores: planDetails[plan].maxStores,
      maxProducts: planDetails[plan].maxProducts,
      features: planDetails[plan].features,
    };
  };

  const subscribeToPlan = (plan: SubscriptionPlan) => {
    const newSubscription: Subscription = {
      plan,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: true,
      autoRenew: true,
    };
    setSubscription(newSubscription);
  };

  const cancelSubscription = () => {
    if (subscription) {
      setSubscription({ ...subscription, autoRenew: false });
    }
  };

  const canCreateStore = (): boolean => {
    if (!subscription || !subscription.active) return false;
    // On devrait vérifier le nombre de boutiques actuelles vs la limite
    return true;
  };

  const canCreateProduct = (): boolean => {
    if (!subscription || !subscription.active) return false;
    // On devrait vérifier le nombre de produits actuels vs la limite
    return true;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        getPlanLimits,
        subscribeToPlan,
        cancelSubscription,
        canCreateStore,
        canCreateProduct,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription doit être utilisé dans un SubscriptionProvider");
  }
  return context;
}
